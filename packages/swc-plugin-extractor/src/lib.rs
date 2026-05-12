#![allow(clippy::not_unsafe_ptr_arg_deref)]
#![feature(box_patterns)]

mod key_generator;

use indexmap::IndexMap;
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

pub struct TransformVisitor {
    is_development: bool,
    file_path: String,
    source_map: Option<Box<dyn SourceMapper>>,

    hook_local_names: FxHashMap<Id, HookType>,

    translator_map: FxHashMap<Id, TranslatorInfo>,

    /// >0 while visiting the initializer of `const translator = await? hook()` (simple binding only).
    approved_hook_initializer_depth: u32,

    /// Messages keyed by ID to aggregate duplicate usages (IndexMap preserves insertion order)
    results_by_id: IndexMap<Wtf8Atom, StrictExtractedMessage>,
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
            approved_hook_initializer_depth: 0,
            results_by_id: Default::default(),
        }
    }

    pub fn get_results(&self) -> Vec<StrictExtractedMessage> {
        self.results_by_id.values().cloned().collect()
    }

    fn define_translator(&mut self, name: Id, namespace: Option<Wtf8Atom>) {
        self.translator_map
            .insert(name, TranslatorInfo { namespace });
    }

    fn call_is_extractor_hook(&self, callee: &Callee) -> bool {
        match callee {
            Callee::Expr(box Expr::Ident(ident)) => {
                self.hook_local_names.contains_key(&ident.to_id())
            }
            _ => false,
        }
    }

    fn maybe_report_extractor_hook_bad_site(&self, callee: &Callee, span: swc_common::Span) {
        if !self.call_is_extractor_hook(callee) {
            return;
        }

        if self.approved_hook_initializer_depth > 0 {
            return;
        }

        Self::emit_use_extracted_hook_site_error(span);
    }

    fn emit_use_extracted_hook_site_error(span: swc_common::Span) {
        HANDLER.with(|handler| {
            handler
                .struct_span_err(
                    span,
                    "`useExtracted()` and `getExtracted()` must be assigned directly like `const t \
                     = useExtracted()` or `const t = await getExtracted()` inside the same scope. Patterns \
                     like `Promise.all`, callbacks, `.then()`, or assigning to destructured bindings are \
                     not statically analyzable for extraction.",
                )
                .emit();
        });
    }

    fn maybe_report_extractor_hook_inside_promise_combinator(&self, call: &CallExpr) {
        let promise_method = match &call.callee {
            Callee::Expr(box Expr::Member(MemberExpr {
                obj: box Expr::Ident(obj),
                prop: MemberProp::Ident(prop),
                ..
            })) if obj.sym == "Promise"
                && matches!(
                    prop.sym.as_ref(),
                    "all" | "allSettled" | "any" | "race" | "try"
                ) =>
            {
                prop.sym.as_ref()
            }
            _ => return,
        };

        for arg in &call.args {
            if promise_method == "all" || promise_method == "allSettled" {
                match &*arg.expr {
                    Expr::Array(arr) => {
                        for elem in &arr.elems {
                            if let Some(ExprOrSpread {
                                expr: elem_expr,
                                spread: None,
                            }) = elem
                            {
                                if self.expr_tree_contains_extractor_hook_call(elem_expr) {
                                    self.emit_extractor_hook_inside_promise_combinator(call.span());
                                    return;
                                }
                            }
                        }
                    }
                    other => {
                        if self.expr_tree_contains_extractor_hook_call(other) {
                            self.emit_extractor_hook_inside_promise_combinator(call.span());
                            return;
                        }
                    }
                }
            } else if self.expr_tree_contains_extractor_hook_call(&arg.expr) {
                self.emit_extractor_hook_inside_promise_combinator(call.span());
                return;
            }
        }
    }

    fn emit_extractor_hook_inside_promise_combinator(&self, span: swc_common::Span) {
        HANDLER.with(|handler| {
            handler
                .struct_span_err(
                    span,
                    "`getExtracted()` / `useExtracted()` calls cannot be bundled into \
                     `Promise.all`, `Promise.race`, or similar combinators — the extractor only \
                     recognizes a plain `await getExtracted()` (or `useExtracted()`) initializer.",
                )
                .emit();
        });
    }

    fn emit_wrong_module_for_extracted_hooks(&self, span: swc_common::Span) {
        HANDLER.with(|handler| {
            handler
                .struct_span_err(
                    span,
                    "`useExtracted` must be imported from `next-intl` and `getExtracted` from \
                     `next-intl/server`. Re-exporting or importing these identifiers from another \
                     module breaks extraction.",
                )
                .emit();
        });
    }

    fn emit_translator_must_not_escape(&self, span: swc_common::Span) {
        // Only identifiers already rewritten into translator_map participate. Forwarding aliases,
        // props, reassigned bindings across functions/files are cross-scope dataflow—the plugin
        // deliberately avoids whole-program tracking (see RFC + extraction docs tradeoffs).
        HANDLER.with(|handler| {
            handler
                .struct_span_err(
                    span,
                    "The translator returned by `useExtracted` / `getExtracted` cannot be forwarded \
                     (as a prop, argument, array element, object value, JSX expression, assignment, etc.). \
                     Call it in the same function where you invoked the hook, with string / template \
                     message literals.",
                )
                .emit();
        });
    }

    /// Optional chaining prevents unifying `OptChainExpr` with `Expr`; keep hook checks explicit.
    fn opt_call_is_extractor_hook(&self, oc: &OptCall) -> bool {
        matches!(
            oc.callee.as_ref(),
            Expr::Ident(i) if self.hook_local_names.contains_key(&i.to_id())
        )
    }

    fn expr_tree_contains_extractor_hook_call(&self, expr: &Expr) -> bool {
        match Self::peel_expr_parens(expr) {
            Expr::Await(AwaitExpr { arg, .. }) => self.expr_tree_contains_extractor_hook_call(arg),
            Expr::Seq(SeqExpr { exprs, .. }) => exprs
                .iter()
                .any(|e| self.expr_tree_contains_extractor_hook_call(e)),
            Expr::Call(CallExpr { callee, args, .. }) => {
                if self.call_is_extractor_hook(callee) {
                    return true;
                }

                args.iter()
                    .any(|a| self.expr_tree_contains_extractor_hook_call(&a.expr))
            }
            Expr::OptChain(OptChainExpr { base, .. }) => match &**base {
                OptChainBase::Call(oc) => {
                    self.opt_call_is_extractor_hook(oc)
                        || oc
                            .args
                            .iter()
                            .any(|a| self.expr_tree_contains_extractor_hook_call(&a.expr))
                }
                OptChainBase::Member(m) => self.expr_tree_contains_extractor_hook_call(&m.obj),
            },
            Expr::Array(ArrayLit { elems, .. }) => elems.iter().any(|maybe| match maybe {
                Some(ExprOrSpread {
                    expr: e,
                    spread: None,
                }) => self.expr_tree_contains_extractor_hook_call(e),
                _ => false,
            }),
            Expr::Object(ObjectLit { props, .. }) => props.iter().any(|prop| match prop {
                PropOrSpread::Spread(SpreadElement { expr, .. }) => {
                    self.expr_tree_contains_extractor_hook_call(expr)
                }
                PropOrSpread::Prop(box prop) => match prop {
                    Prop::KeyValue(KeyValueProp { value, .. }) => {
                        self.expr_tree_contains_extractor_hook_call(value)
                    }
                    Prop::Assign(AssignProp { value, .. }) => {
                        self.expr_tree_contains_extractor_hook_call(value)
                    }
                    _ => false,
                },
            }),
            Expr::Assign(AssignExpr { right, .. }) => {
                self.expr_tree_contains_extractor_hook_call(right)
            }
            Expr::Cond(CondExpr {
                test, cons, alt, ..
            }) => {
                self.expr_tree_contains_extractor_hook_call(test)
                    || self.expr_tree_contains_extractor_hook_call(cons)
                    || self.expr_tree_contains_extractor_hook_call(alt)
            }
            Expr::Tpl(Tpl { exprs, .. }) => exprs
                .iter()
                .any(|e| self.expr_tree_contains_extractor_hook_call(e)),
            Expr::Unary(UnaryExpr { arg, .. }) => self.expr_tree_contains_extractor_hook_call(arg),
            Expr::Bin(BinExpr { left, right, .. }) => {
                self.expr_tree_contains_extractor_hook_call(left)
                    || self.expr_tree_contains_extractor_hook_call(right)
            }
            Expr::New(NewExpr { args, callee, .. }) => {
                self.expr_tree_contains_extractor_hook_call(callee.as_ref())
                    || args.as_ref().is_some_and(|arguments| {
                        arguments
                            .iter()
                            .any(|a| self.expr_tree_contains_extractor_hook_call(&a.expr))
                    })
            }
            _ => false,
        }
    }

    fn peel_expr_parens(mut expr: &Expr) -> &Expr {
        while let Expr::Paren(ParenExpr { expr: inner, .. }) = expr {
            expr = inner;
        }
        expr
    }

    fn peel_awaits_then_parens(mut expr: &Expr) -> &Expr {
        loop {
            expr = Self::peel_expr_parens(expr);
            match expr {
                Expr::Await(AwaitExpr { arg, .. }) => expr = arg,
                other => break other,
            }
        }
    }

    fn expr_matches_plain_extractor_hook_initializer(&self, expr: &Expr) -> bool {
        let expr = Self::peel_awaits_then_parens(expr);
        match Self::peel_expr_parens(expr) {
            Expr::Call(CallExpr { callee, .. }) => self.call_is_extractor_hook(callee),
            Expr::OptChain(OptChainExpr {
                base: box OptChainBase::Call(oc),
                ..
            }) => self.opt_call_is_extractor_hook(oc),
            _ => false,
        }
    }

    fn check_translator_not_forwarded_in_expr(&mut self, expr: &Expr) {
        match Self::peel_expr_parens(expr) {
            Expr::Ident(ident) => {
                if self.translator_map.contains_key(&ident.to_id()) {
                    self.emit_translator_must_not_escape(ident.span());
                }
            }

            Expr::Await(AwaitExpr { arg, .. }) => self.check_translator_not_forwarded_in_expr(arg),

            Expr::Call(CallExpr { callee, args, .. }) => {
                for arg in args {
                    self.check_translator_not_forwarded_in_expr(&arg.expr);
                }

                match callee {
                    Callee::Expr(..) => {}
                    _ => {}
                }
            }

            Expr::OptChain(OptChainExpr { base, .. }) => match &**base {
                OptChainBase::Call(oc) => {
                    self.check_translator_not_forwarded_in_expr(oc.callee.as_ref());
                    for a in &oc.args {
                        self.check_translator_not_forwarded_in_expr(&a.expr);
                    }
                }
                OptChainBase::Member(MemberExpr { obj, .. }) => {
                    self.check_translator_not_forwarded_in_expr(obj);
                }
            },

            Expr::Seq(SeqExpr { exprs, .. }) => {
                for e in exprs {
                    self.check_translator_not_forwarded_in_expr(e);
                }
            }

            Expr::Array(ArrayLit { elems, .. }) => {
                for elem in elems {
                    if let Some(ExprOrSpread { expr: e, .. }) = elem {
                        self.check_translator_not_forwarded_in_expr(e);
                    }
                }
            }

            Expr::Object(ObjectLit { props, .. }) => {
                for prop in props {
                    match prop {
                        PropOrSpread::Spread(SpreadElement { expr, .. }) => {
                            self.check_translator_not_forwarded_in_expr(expr);
                        }
                        PropOrSpread::Prop(box Prop::KeyValue(KeyValueProp { value, .. })) => {
                            self.check_translator_not_forwarded_in_expr(value);
                        }
                        PropOrSpread::Prop(box Prop::Assign(AssignProp { value, .. })) => {
                            self.check_translator_not_forwarded_in_expr(value);
                        }
                        _ => {}
                    }
                }
            }

            Expr::Assign(AssignExpr { right, .. }) => {
                self.check_translator_not_forwarded_in_expr(right)
            }

            Expr::Cond(CondExpr {
                test, cons, alt, ..
            }) => {
                self.check_translator_not_forwarded_in_expr(test);
                self.check_translator_not_forwarded_in_expr(cons);
                self.check_translator_not_forwarded_in_expr(alt);
            }

            Expr::Tpl(Tpl { exprs, .. }) => {
                for e in exprs {
                    self.check_translator_not_forwarded_in_expr(e);
                }
            }

            Expr::Unary(UnaryExpr { arg, .. }) => self.check_translator_not_forwarded_in_expr(arg),

            Expr::Bin(BinExpr { left, right, .. }) => {
                self.check_translator_not_forwarded_in_expr(left);
                self.check_translator_not_forwarded_in_expr(right);
            }

            Expr::New(NewExpr { callee, args, .. }) => {
                self.check_translator_not_forwarded_in_expr(callee);
                if let Some(arguments) = args {
                    for a in arguments {
                        self.check_translator_not_forwarded_in_expr(&a.expr);
                    }
                }
            }

            Expr::TaggedTpl(tpl) => {
                self.check_translator_not_forwarded_in_expr(&tpl.tag);
                for e in tpl.tpl.exprs.iter() {
                    self.check_translator_not_forwarded_in_expr(e);
                }
            }

            Expr::Arrow(ArrowExpr { body, .. }) => match body.as_ref() {
                BlockStmtOrExpr::Expr(e) => self.check_translator_not_forwarded_in_expr(e),
                BlockStmtOrExpr::BlockStmt(_) => {}
            },

            Expr::Paren(_) => {}

            _ => {}
        }
    }

    fn check_translator_args_after_message(&mut self, call: &CallExpr) {
        let skip_initial = match &call.callee {
            Callee::Expr(box Expr::Ident(_)) => 1,
            Callee::Expr(box Expr::Member(MemberExpr {
                prop: MemberProp::Ident(prop),
                ..
            })) if matches!(prop.sym.as_ref(), "rich" | "markup" | "has") => 1,
            _ => 0,
        };

        let start_after_message = usize::try_from(skip_initial)
            .unwrap_or(0)
            .min(call.args.len());

        for arg in call.args.iter().skip(start_after_message) {
            self.check_translator_not_forwarded_in_expr(&arg.expr);
        }
    }
}

#[derive(Debug, Clone)]
struct TranslatorInfo {
    namespace: Option<Wtf8Atom>,
}

#[derive(Debug, Clone, Serialize)]
pub struct StrictExtractedMessage {
    pub id: Wtf8Atom,
    pub message: Wtf8Atom,
    pub description: Option<Wtf8Atom>,
    pub references: Vec<Reference>,
}

#[derive(Debug, Clone, Serialize)]
pub struct Reference {
    pub path: String,
    pub line: usize,
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

    /// The unique local identifier used to avoid conflicts with existing imports
    fn local_name(self) -> swc_atoms::Atom {
        match self {
            HookType::UseTranslation => "useTranslations$1".into(),
            HookType::GetTranslation => "getTranslations$1".into(),
        }
    }
}

impl VisitMut for TransformVisitor {
    fn visit_mut_assign_expr(&mut self, assign: &mut AssignExpr) {
        self.check_translator_not_forwarded_in_expr(&assign.right);
        assign.visit_mut_children_with(self);
    }

    fn visit_mut_return_stmt(&mut self, stmt: &mut ReturnStmt) {
        if let Some(arg) = &stmt.arg {
            self.check_translator_not_forwarded_in_expr(arg);
        }
        stmt.visit_mut_children_with(self);
    }

    fn visit_mut_jsx_opening_element(&mut self, el: &mut JSXOpeningElement) {
        for attr in &mut el.attrs {
            match attr {
                JSXAttrOrSpread::SpreadElement(SpreadElement { expr, .. }) => {
                    self.check_translator_not_forwarded_in_expr(expr);
                }
                JSXAttrOrSpread::JSXAttr(jsx_attr) => {
                    if let Some(JSXAttrValue::JSXExprContainer(container)) = &mut jsx_attr.value {
                        match &mut container.expr {
                            JSXExpr::Expr(box expr) => {
                                self.check_translator_not_forwarded_in_expr(expr);
                            }
                            JSXExpr::JSXEmptyExpr(_) => {}
                        }
                    }
                }
            }
        }
        el.visit_mut_children_with(self);
    }

    fn visit_mut_jsx_expr_container(&mut self, c: &mut JSXExprContainer) {
        match &mut c.expr {
            JSXExpr::Expr(box expr) => self.check_translator_not_forwarded_in_expr(expr),
            JSXExpr::JSXEmptyExpr(_) => {}
        }
        c.visit_mut_children_with(self);
    }

    fn visit_mut_jsx_spread_child(&mut self, node: &mut JSXSpreadChild) {
        self.check_translator_not_forwarded_in_expr(&node.expr);
        node.visit_mut_children_with(self);
    }

    fn visit_mut_call_expr(&mut self, call: &mut CallExpr) {
        self.maybe_report_extractor_hook_inside_promise_combinator(call);

        if let Callee::Expr(box Expr::Ident(i)) = &call.callee {
            self.maybe_report_extractor_hook_bad_site(&call.callee, i.span());
        }

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
                let line = self
                    .source_map
                    .as_ref()
                    .map_or(0, |sm| sm.lookup_char_pos(call.span.lo).line);
                let new_reference = Reference {
                    path: self.file_path.clone(),
                    line,
                };

                // Aggregate duplicate messages by ID
                if let Some(existing) = self.results_by_id.get_mut(&full_key) {
                    existing.references.push(new_reference);
                    if existing.description.is_none() {
                        existing.description = description;
                    }
                } else {
                    let message = StrictExtractedMessage {
                        id: full_key.clone(),
                        message: message_text.clone(),
                        description,
                        references: vec![new_reference],
                    };
                    self.results_by_id.insert(full_key, message);
                }

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

            self.check_translator_args_after_message(call);
        } else if !matches!(&call.callee, Callee::Import(..)) {
            for arg in &call.args {
                self.check_translator_not_forwarded_in_expr(&arg.expr);
            }
        }

        call.visit_mut_children_with(self);
    }

    fn visit_mut_module(&mut self, module: &mut Module) {
        for import in module.body.iter_mut() {
            if let ModuleItem::ModuleDecl(ModuleDecl::Import(import)) = import {
                let bytes = import.src.value.as_bytes();
                if bytes != b"next-intl" && bytes != b"next-intl/server" {
                    for specifier in &import.specifiers {
                        let ImportSpecifier::Named(named_spec) = specifier else {
                            continue;
                        };

                        let orig_name = named_spec
                            .imported
                            .as_ref()
                            .and_then(|exported| match exported {
                                ModuleExportName::Ident(ident) => Some(ident.sym.clone()),
                                ModuleExportName::Str(..) => None,
                            })
                            .unwrap_or_else(|| named_spec.local.sym.clone());

                        if orig_name == HookType::UseTranslation.extracted_name()
                            || orig_name == HookType::GetTranslation.extracted_name()
                        {
                            let span = import.span;
                            self.emit_wrong_module_for_extracted_hooks(span);
                        }
                    }
                }

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
        let simple_pat = matches!(&node.name, Pat::Ident(_));
        let approved_init = simple_pat
            && node
                .init
                .as_ref()
                .is_some_and(|init| self.expr_matches_plain_extractor_hook_initializer(init));

        let prev_depth = self.approved_hook_initializer_depth;
        if approved_init {
            self.approved_hook_initializer_depth += 1;
        }

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

        if approved_init {
            self.approved_hook_initializer_depth = prev_depth;
        }
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
