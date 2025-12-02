#![allow(clippy::not_unsafe_ptr_arg_deref)]
#![feature(box_patterns)]

mod key_generator;

use rustc_hash::FxHashMap;
use serde::{Deserialize, Serialize};
use swc_atoms::Wtf8Atom;
use swc_common::{errors::HANDLER, Spanned, DUMMY_SP};
use swc_core::{
    plugin::proxies::TransformPluginProgramMetadata, transform_common::output::experimental_emit,
};
use swc_ecma_ast::*;
use swc_ecma_utils::ExprFactory;
use swc_ecma_visit::{VisitMut, VisitMutWith};
use swc_plugin_macro::plugin_transform;

#[plugin_transform]
fn next_intl_plugin(mut program: Program, data: TransformPluginProgramMetadata) -> Program {
    let config = serde_json::from_str::<Config>(
        &data
            .get_transform_plugin_config()
            .expect("Failed to get plugin config"),
    )
    .expect("Invalid config");

    let mut visitor = TransformVisitor::new(config.is_development, config.file_path);
    program.visit_mut_with(&mut visitor);

    experimental_emit(
        "results".into(),
        serde_json::to_string(&visitor.results).unwrap(),
    );

    program
}

const NAMESPACE_SEPARATOR: &str = ".";

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Config {
    is_development: bool,
    file_path: String,
}

pub struct TransformVisitor {
    is_development: bool,
    file_path: String,

    hook_local_names: FxHashMap<Id, HookType>,

    translator_map: FxHashMap<Id, TranslatorInfo>,

    results: Vec<StrictExtractedMessage>,
}

impl TransformVisitor {
    pub fn new(is_development: bool, file_path: String) -> Self {
        Self {
            is_development,
            file_path,
            hook_local_names: Default::default(),
            translator_map: Default::default(),
            results: Default::default(),
        }
    }

    fn define_translator(&mut self, name: Id, namespace: Option<Wtf8Atom>) {
        self.translator_map
            .insert(name, TranslatorInfo { namespace });
    }
}

#[derive(Debug, Clone)]
struct TranslatorInfo {
    namespace: Option<Wtf8Atom>,
}

#[derive(Debug, Clone, Serialize)]
struct StrictExtractedMessage {
    id: Wtf8Atom,
    message: Wtf8Atom,
    description: Option<Wtf8Atom>,
    references: Vec<Reference>,
}

#[derive(Debug, Clone, Serialize)]
struct Reference {
    path: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
enum HookType {
    UseTranslation,
    GetTranslation,
}

impl HookType {
    /// The extracted hook name we look for in imports (e.g. `useExtracted`)
    fn extracted_name(self) -> &'static str {
        match self {
            HookType::UseTranslation => "useExtracted",
            HookType::GetTranslation => "getExtracted",
        }
    }

    /// The real hook name we import from next-intl (e.g. `useTranslations`)
    fn target_name(self) -> &'static str {
        match self {
            HookType::UseTranslation => "useTranslations",
            HookType::GetTranslation => "getTranslations",
        }
    }

    /// The unique local identifier used to avoid conflicts with existing imports.
    /// Uses `$1` suffix since it's an invalid user-written identifier ($ followed by
    /// a digit), ensuring no collisions with user code.
    fn local_name(self) -> swc_atoms::Atom {
        match self {
            HookType::UseTranslation => "useTranslations$1".into(),
            HookType::GetTranslation => "getTranslations$1".into(),
        }
    }
}

impl VisitMut for TransformVisitor {
    fn visit_mut_call_expr(&mut self, call: &mut CallExpr) {
        let mut is_translator_call = false;
        let mut namespace = None;

        // Handle Identifier case: t("message")
        match &call.callee {
            Callee::Expr(box Expr::Ident(ident)) => {
                if let Some(translator) = self.translator_map.get(&ident.to_id()) {
                    is_translator_call = true;
                    namespace = translator.namespace.clone();
                }
            }

            Callee::Expr(box Expr::Member(MemberExpr {
                obj: box Expr::Ident(obj),
                prop: MemberProp::Ident(prop),
                ..
            })) => {
                if matches!(&*prop.sym, "rich" | "markup" | "has") {
                    if let Some(translator) = self.translator_map.get(&obj.to_id()) {
                        is_translator_call = true;
                        namespace = translator.namespace.clone();
                    }
                }
            }

            _ => {}
        }

        if is_translator_call {
            let arg0 = call.args.first();

            let mut message_text = None;
            let mut explicit_id = None;
            let mut description = None;
            let mut values_node = None;
            let mut formats_node = None;

            if let Some(arg0) = arg0 {
                match &*arg0.expr {
                    // Handle object syntax: t({id: 'key', message: 'text'})
                    Expr::Object(ObjectLit { props, .. }) => {
                        for prop in props {
                            if let PropOrSpread::Prop(box Prop::KeyValue(KeyValueProp {
                                key: PropName::Ident(key),
                                value,
                                ..
                            })) = prop
                            {
                                if key.sym == "id" {
                                    let static_id = extract_static_string(value);
                                    if let Some(static_id) = static_id {
                                        explicit_id = Some(static_id);
                                    }
                                } else if key.sym == "message" {
                                    let static_message = extract_static_string(value);
                                    if let Some(static_message) = static_message {
                                        message_text = Some(static_message);
                                    } else {
                                        warn_dynamic_expression(value);
                                    }
                                } else if key.sym == "description" {
                                    let static_description = extract_static_string(value);
                                    if let Some(static_description) = static_description {
                                        description = Some(static_description);
                                    } else {
                                        warn_dynamic_expression(value);
                                    }
                                } else if key.sym == "values" {
                                    values_node = Some(value.clone());
                                } else if key.sym == "formats" {
                                    formats_node = Some(value.clone());
                                }
                            }
                        }
                    }

                    // Handle string syntax: t('text') or t(`text`)
                    _ => {
                        let static_string = extract_static_string(&arg0.expr);
                        if let Some(static_string) = static_string {
                            message_text = Some(static_string);
                        } else {
                            // Dynamic expression (Identifier, CallExpression, BinaryExpression,
                            // etc.)
                            warn_dynamic_expression(&arg0.expr);
                        }
                    }
                }
            }

            if let Some(message_text) = message_text {
                let call_key = explicit_id
                    .unwrap_or_else(|| key_generator::KeyGenerator::generate(&message_text).into());
                let full_key = namespace.map_or(call_key.clone(), |namespace| {
                    [&*namespace.to_string_lossy(), &*call_key.to_string_lossy()]
                        .join(NAMESPACE_SEPARATOR)
                        .into()
                });
                let mut message = StrictExtractedMessage {
                    id: full_key,
                    message: message_text.clone(),
                    description: None,
                    references: vec![Reference {
                        path: self.file_path.clone(),
                    }],
                };
                if let Some(description) = description {
                    message.description = Some(description.clone());
                }
                self.results.push(message);

                // Transform the argument based on type
                match &mut *call.args[0].expr {
                    Expr::Lit(Lit::Str(s)) => {
                        s.value = call_key;
                        s.raw = None;
                    }

                    Expr::Tpl(tpl) => {
                        // Replace template literal with string literal
                        *call.args[0].expr = Expr::Lit(Lit::Str(Str {
                            span: tpl.span,
                            value: call_key,
                            raw: None,
                        }));
                    }

                    Expr::Object(ObjectLit { span: obj_span, .. }) => {
                        // Transform object expression to individual parameters
                        // Replace the object with the key as first argument

                        *call.args[0].expr = Expr::Lit(Lit::Str(Str {
                            span: *obj_span,
                            value: call_key,
                            raw: None,
                        }));

                        // Add values as second argument if present
                        if let Some(values_node) = values_node {
                            if call.args.len() < 2 {
                                call.args.push(ExprOrSpread {
                                    spread: None,
                                    expr: values_node.clone(),
                                });
                            } else {
                                call.args[1].expr = values_node.clone();
                            }
                        }

                        // Add formats as third argument if present
                        if let Some(formats_node) = formats_node {
                            while call.args.len() < 2 {
                                call.args.push(Expr::undefined(DUMMY_SP).as_arg());
                            }

                            if call.args.len() < 3 {
                                call.args.push(ExprOrSpread {
                                    spread: None,
                                    expr: formats_node.clone(),
                                });
                            } else {
                                call.args[2].expr = formats_node.clone();
                            }
                        }
                    }

                    _ => {}
                }

                // Check if this is a t.has call (which doesn't need fallback)
                let is_has_call = match &call.callee {
                    Callee::Expr(box Expr::Member(MemberExpr {
                        prop: MemberProp::Ident(prop),
                        ..
                    })) => prop.sym == "has",
                    _ => false,
                };

                // Add fallback message as 4th parameter in development mode (except for t.has)
                if self.is_development && !is_has_call {
                    while call.args.len() < 3 {
                        call.args.push(Expr::undefined(DUMMY_SP).as_arg());
                    }

                    call.args.push(
                        Str {
                            span: DUMMY_SP,
                            value: message_text,
                            raw: None,
                        }
                        .as_arg(),
                    );
                }
            }
        }

        call.visit_mut_children_with(self);
    }

    fn visit_mut_module(&mut self, module: &mut Module) {
        for import in module.body.iter_mut() {
            if let ModuleItem::ModuleDecl(ModuleDecl::Import(import)) = import {
                match import.src.value.as_bytes() {
                    b"next-intl" => {
                        for specifier in &mut import.specifiers {
                            if let ImportSpecifier::Named(named_spec) = specifier {
                                let orig_name = named_spec
                                    .imported
                                    .as_ref()
                                    .and_then(|x| match x {
                                        ModuleExportName::Ident(ident) => Some(ident.sym.clone()),
                                        ModuleExportName::Str(..) => None,
                                    })
                                    .unwrap_or_else(|| named_spec.local.sym.clone())
                                    .clone();

                                if orig_name == HookType::UseTranslation.extracted_name() {
                                    self.hook_local_names
                                        .insert(named_spec.local.to_id(), HookType::UseTranslation);

                                    named_spec.imported = Some(ModuleExportName::Ident(
                                        HookType::UseTranslation.target_name().into(),
                                    ));
                                    named_spec.local = Ident::new(
                                        HookType::UseTranslation.local_name(),
                                        DUMMY_SP,
                                        named_spec.local.ctxt,
                                    );
                                }
                            }
                        }
                    }

                    b"next-intl/server" => {
                        for specifier in &mut import.specifiers {
                            if let ImportSpecifier::Named(named_spec) = specifier {
                                let orig_name = named_spec
                                    .imported
                                    .as_ref()
                                    .and_then(|x| match x {
                                        ModuleExportName::Ident(ident) => Some(ident.sym.clone()),
                                        ModuleExportName::Str(_) => None,
                                    })
                                    .unwrap_or_else(|| named_spec.local.sym.clone())
                                    .clone();

                                if orig_name == HookType::GetTranslation.extracted_name() {
                                    self.hook_local_names
                                        .insert(named_spec.local.to_id(), HookType::GetTranslation);

                                    named_spec.imported = Some(ModuleExportName::Ident(
                                        HookType::GetTranslation.target_name().into(),
                                    ));
                                    named_spec.local = Ident::new(
                                        HookType::GetTranslation.local_name(),
                                        DUMMY_SP,
                                        named_spec.local.ctxt,
                                    );
                                }
                            }
                        }
                    }

                    _ => {}
                }
            }
        }

        module.visit_mut_children_with(self);
    }

    fn visit_mut_var_declarator(&mut self, node: &mut VarDeclarator) {
        if let Some(name) = node.name.as_ident() {
            let mut call_expr = None;

            // Handle direct CallExpression: const t = useExtracted();

            if let Some(init) = &mut node.init {
                match &mut **init {
                    Expr::Call(init_call) => {
                        if let Callee::Expr(box Expr::Ident(callee)) = &init_call.callee {
                            if let Some(hook_type) = self.hook_local_names.get(&callee.to_id()) {
                                init_call.callee = Callee::Expr(
                                    Ident::new(hook_type.local_name(), DUMMY_SP, callee.ctxt)
                                        .into(),
                                );
                                call_expr = Some(init_call);
                            }
                        }
                    }

                    Expr::Await(AwaitExpr {
                        arg: box Expr::Call(arg),
                        ..
                    }) => {
                        if let CallExpr {
                            callee: Callee::Expr(box Expr::Ident(callee)),
                            ..
                        } = &*arg
                        {
                            if let Some(hook_type) = self.hook_local_names.get(&callee.to_id()) {
                                arg.callee = Callee::Expr(
                                    Ident::new(hook_type.local_name(), DUMMY_SP, callee.ctxt)
                                        .into(),
                                );
                                call_expr = Some(arg);
                            }
                        }
                    }

                    _ => {}
                }
            }

            if let Some(call_expr) = call_expr {
                let namespace = call_expr.args.first().and_then(|arg| match &*arg.expr {
                    Expr::Lit(Lit::Str(s)) => Some(s.value.clone()),
                    Expr::Object(ObjectLit { props, .. }) => props.iter().find_map(|prop| {
                        let prop = prop.as_prop()?.as_key_value()?;
                        match &prop.key {
                            PropName::Ident(ident) => {
                                if ident.sym == "namespace" {
                                    Some(extract_static_string(&prop.value))
                                } else {
                                    None
                                }
                            }
                            _ => None,
                        }
                    })?,
                    _ => None,
                });

                self.define_translator(name.to_id(), namespace)
            }
        }

        node.visit_mut_children_with(self);
    }
}

fn warn_dynamic_expression(expr: &Expr) {
    HANDLER.with(|handler| {
        handler
            .struct_span_err(
                expr.span(),
                "Cannot extract message from dynamic expression, messages need to be statically \
                 analyzable. If you need to provide runtime values, pass them as a separate \
                 argument.",
            )
            .emit();
    })
}

fn extract_static_string(value: &Expr) -> Option<Wtf8Atom> {
    match value {
        Expr::Lit(Lit::Str(s)) => Some(s.value.clone()),
        Expr::Tpl(tpl) => {
            if tpl.quasis.len() != 1 {
                return None;
            }

            let quasi = &tpl.quasis[0];

            let cooked = quasi.cooked.as_ref()?;
            Some(cooked.clone())
        }

        _ => None,
    }
}
