#![allow(clippy::not_unsafe_ptr_arg_deref)]
#![feature(box_patterns)]

mod key_generator;

use rustc_hash::FxHashMap;
use serde::{Deserialize, Serialize};
use swc_atoms::Wtf8Atom;
use swc_common::{errors::HANDLER, Spanned, DUMMY_SP};
use swc_core::{
    common::SourceMapper, plugin::proxies::TransformPluginProgramMetadata,
    transform_common::output::experimental_emit,
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

    let mut visitor = TransformVisitor::new(
        config.is_development,
        config.file_path,
        Some(Box::new(data.source_map) as Box<dyn SourceMapper>),
    );
    program.visit_mut_with(&mut visitor);

    experimental_emit(
        "results".into(),
        serde_json::to_string(&visitor.get_results()).unwrap(),
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

/// A statically analyzable usage, tagged by kind in the serialized output.
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum SourceMessage {
    /// An inline message from `useExtracted` / `getExtracted`.
    Extracted(ExtractedMessage),
    /// A `useTranslations` / `getTranslations` key reference.
    Translation(TranslationUse),
}

#[derive(Debug, Clone, Serialize)]
pub struct ExtractedMessage {
    pub id: Wtf8Atom,
    pub message: Wtf8Atom,
    pub description: Option<Wtf8Atom>,
    pub reference: Reference,
}

#[derive(Debug, Clone, Serialize)]
pub struct TranslationUse {
    pub id: String,
    pub reference: Reference,
}

#[derive(Debug, Clone, Serialize)]
pub struct Reference {
    pub path: String,
    pub line: usize,
}

/// A next-intl hook a translator can be bound to.
#[derive(Debug, Clone, Copy)]
enum Hook {
    /// `useExtracted` / `getExtracted` — extracts inline messages and is
    /// rewritten to the real translations hook.
    Extracted(ExtractedHook),
    /// Plain `useTranslations` / `getTranslations` — usages are recorded as-is.
    Translation,
}

/// The client (`useExtracted`) or server (`getExtracted`) extraction hook.
#[derive(Debug, Clone, Copy)]
enum ExtractedHook {
    Client,
    Server,
}

impl ExtractedHook {
    /// The hook name we look for in imports (e.g. `useExtracted`).
    fn imported_name(self) -> &'static str {
        match self {
            ExtractedHook::Client => "useExtracted",
            ExtractedHook::Server => "getExtracted",
        }
    }

    /// The real next-intl hook it's rewritten to (e.g. `useTranslations`).
    fn target_name(self) -> &'static str {
        match self {
            ExtractedHook::Client => "useTranslations",
            ExtractedHook::Server => "getTranslations",
        }
    }

    /// A unique local identifier to avoid conflicts with existing imports.
    fn local_name(self) -> swc_atoms::Atom {
        match self {
            ExtractedHook::Client => "useTranslations$1".into(),
            ExtractedHook::Server => "getTranslations$1".into(),
        }
    }
}

#[derive(Debug, Clone, Copy)]
enum TranslatorKind {
    Extracted,
    Translation,
}

/// A translator binding such as `const t = useTranslations('ns')`.
struct Translator {
    kind: TranslatorKind,
    namespace: Option<Wtf8Atom>,
}

pub struct TransformVisitor {
    is_development: bool,
    file_path: String,
    source_map: Option<Box<dyn SourceMapper>>,

    /// Local import names of next-intl hooks (`useExtracted`, `useTranslations`, …).
    hook_local_names: FxHashMap<Id, Hook>,

    /// Translator bindings created from those hooks.
    translator_map: FxHashMap<Id, Translator>,

    /// Each statically analyzable usage in discovery order.
    results: Vec<SourceMessage>,
}

impl TransformVisitor {
    pub fn new(
        is_development: bool,
        file_path: String,
        source_map: Option<Box<dyn SourceMapper>>,
    ) -> Self {
        Self {
            is_development,
            file_path,
            source_map,
            hook_local_names: Default::default(),
            translator_map: Default::default(),
            results: Default::default(),
        }
    }

    pub fn get_results(&self) -> Vec<SourceMessage> {
        self.results.clone()
    }

    /// The kind and namespace of the translator a call's callee is bound to,
    /// honoring the member methods valid for each kind (`t`, `t.rich`, …).
    fn resolve_translator(&self, callee: &Callee) -> Option<(TranslatorKind, Option<Wtf8Atom>)> {
        match callee {
            Callee::Expr(box Expr::Ident(ident)) => {
                let translator = self.translator_map.get(&ident.to_id())?;
                Some((translator.kind, translator.namespace.clone()))
            }
            Callee::Expr(box Expr::Member(MemberExpr {
                obj: box Expr::Ident(obj),
                prop: MemberProp::Ident(prop),
                ..
            })) => {
                let translator = self.translator_map.get(&obj.to_id())?;
                let valid_method = match translator.kind {
                    TranslatorKind::Extracted => matches!(&*prop.sym, "rich" | "markup" | "has"),
                    TranslatorKind::Translation => {
                        matches!(&*prop.sym, "rich" | "markup" | "has" | "raw")
                    }
                };
                valid_method.then(|| (translator.kind, translator.namespace.clone()))
            }
            _ => None,
        }
    }

    /// Records a `useTranslations` / `getTranslations` key reference, resolving
    /// the id as far as it is statically known (namespace and/or key).
    fn record_translation(&mut self, call: &CallExpr, namespace: Option<Wtf8Atom>) {
        let key = call
            .args
            .first()
            .and_then(|arg| extract_static_string(&arg.expr));
        let id = match (namespace, key) {
            (Some(ns), Some(k)) => format!(
                "{}{}{}",
                ns.to_string_lossy(),
                NAMESPACE_SEPARATOR,
                k.to_string_lossy()
            ),
            // A dynamic key under a namespace covers the whole namespace.
            (Some(ns), None) => ns.to_string_lossy().to_string(),
            (None, Some(k)) => k.to_string_lossy().to_string(),
            // `useTranslations()` with a dynamic key can't be statically analyzed; skip it.
            (None, None) => return,
        };
        let line = self
            .source_map
            .as_ref()
            .map_or(0, |sm| sm.lookup_char_pos(call.span.lo).line);
        self.results
            .push(SourceMessage::Translation(TranslationUse {
                id,
                reference: Reference {
                    path: self.file_path.clone(),
                    line,
                },
            }));
    }

    /// Records an inline `useExtracted` / `getExtracted` message and rewrites the
    /// call to reference the generated key.
    fn extract_message(&mut self, call: &mut CallExpr, namespace: Option<Wtf8Atom>) {
        let mut message_text = None;
        let mut explicit_id = None;
        let mut description = None;
        let mut values_node = None;
        let mut formats_node = None;

        if let Some(arg0) = call.args.first() {
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
                        // Dynamic expression (Identifier, CallExpression, BinaryExpression, etc.)
                        warn_dynamic_expression(&arg0.expr);
                    }
                }
            }
        }

        let Some(message_text) = message_text else {
            return;
        };

        let call_key = explicit_id
            .unwrap_or_else(|| key_generator::KeyGenerator::generate(&message_text).into());
        let full_key = namespace.map_or(call_key.clone(), |namespace| {
            [&*namespace.to_string_lossy(), &*call_key.to_string_lossy()]
                .join(NAMESPACE_SEPARATOR)
                .into()
        });
        let line = self
            .source_map
            .as_ref()
            .map_or(0, |sm| sm.lookup_char_pos(call.span.lo).line);

        self.results
            .push(SourceMessage::Extracted(ExtractedMessage {
                id: full_key,
                message: message_text.clone(),
                description,
                reference: Reference {
                    path: self.file_path.clone(),
                    line,
                },
            }));

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

impl VisitMut for TransformVisitor {
    fn visit_mut_call_expr(&mut self, call: &mut CallExpr) {
        match self.resolve_translator(&call.callee) {
            // `useTranslations`/`getTranslations`: record the key, don't transform.
            Some((TranslatorKind::Translation, namespace)) => {
                self.record_translation(call, namespace);
            }
            // `useExtracted`/`getExtracted`: extract the inline message and rewrite.
            Some((TranslatorKind::Extracted, namespace)) => {
                self.extract_message(call, namespace);
            }
            None => {}
        }

        call.visit_mut_children_with(self);
    }

    fn visit_mut_module(&mut self, module: &mut Module) {
        for item in module.body.iter_mut() {
            let ModuleItem::ModuleDecl(ModuleDecl::Import(import)) = item else {
                continue;
            };
            let extracted_hook = match import.src.value.as_bytes() {
                b"next-intl" => ExtractedHook::Client,
                b"next-intl/server" => ExtractedHook::Server,
                _ => continue,
            };

            for specifier in &mut import.specifiers {
                let ImportSpecifier::Named(named_spec) = specifier else {
                    continue;
                };
                let orig_name = named_spec
                    .imported
                    .as_ref()
                    .and_then(|name| match name {
                        ModuleExportName::Ident(ident) => Some(ident.sym.clone()),
                        ModuleExportName::Str(..) => None,
                    })
                    .unwrap_or_else(|| named_spec.local.sym.clone());

                if orig_name == extracted_hook.imported_name() {
                    // Track and rewrite `useExtracted` / `getExtracted`.
                    self.hook_local_names
                        .insert(named_spec.local.to_id(), Hook::Extracted(extracted_hook));
                    named_spec.imported =
                        Some(ModuleExportName::Ident(extracted_hook.target_name().into()));
                    named_spec.local =
                        Ident::new(extracted_hook.local_name(), DUMMY_SP, named_spec.local.ctxt);
                } else if orig_name == extracted_hook.target_name() {
                    // Track plain `useTranslations` / `getTranslations`.
                    self.hook_local_names
                        .insert(named_spec.local.to_id(), Hook::Translation);
                }
            }
        }

        module.visit_mut_children_with(self);
    }

    fn visit_mut_var_declarator(&mut self, node: &mut VarDeclarator) {
        if let Some(name) = node.name.as_ident() {
            if let Some(init) = &mut node.init {
                // Unwrap `await getX(...)` and direct `useX(...)` initializers.
                let call = match &mut **init {
                    Expr::Call(call) => Some(call),
                    Expr::Await(AwaitExpr {
                        arg: box Expr::Call(call),
                        ..
                    }) => Some(call),
                    _ => None,
                };

                if let Some(call) = call {
                    let binding = match &call.callee {
                        Callee::Expr(box Expr::Ident(callee)) => self
                            .hook_local_names
                            .get(&callee.to_id())
                            .copied()
                            .map(|hook| (hook, callee.ctxt)),
                        _ => None,
                    };

                    if let Some((hook, ctxt)) = binding {
                        let kind = match hook {
                            Hook::Extracted(extracted_hook) => {
                                // Rewrite the callee to the real (aliased) hook.
                                call.callee = Callee::Expr(
                                    Ident::new(extracted_hook.local_name(), DUMMY_SP, ctxt).into(),
                                );
                                TranslatorKind::Extracted
                            }
                            Hook::Translation => TranslatorKind::Translation,
                        };
                        let namespace = namespace_of_call(call);
                        self.translator_map
                            .insert(name.to_id(), Translator { kind, namespace });
                    }
                }
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

/// The namespace passed to a `useTranslations('ns')` / `getTranslations({namespace})` call.
fn namespace_of_call(call: &CallExpr) -> Option<Wtf8Atom> {
    call.args.first().and_then(|arg| match &*arg.expr {
        Expr::Lit(Lit::Str(s)) => Some(s.value.clone()),
        Expr::Object(ObjectLit { props, .. }) => props.iter().find_map(|prop| {
            let prop = prop.as_prop()?.as_key_value()?;
            match &prop.key {
                PropName::Ident(ident) if ident.sym == "namespace" => {
                    Some(extract_static_string(&prop.value))
                }
                _ => None,
            }
        })?,
        _ => None,
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
