use swc_core::ecma::{
    ast::{
        ArrowExpr, BlockStmt, CallExpr, Callee, Expr, Function, ImportDecl, ImportSpecifier, Lit,
        ModuleExportName, Pat, VarDecl,
    },
    visit::{VisitMut, VisitMutWith},
};

use crate::extracted_message::ExtractedMessage;
use crate::generate_key::generate_key;
use crate::scope_stack::ScopeStack;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TraversalMode {
    Analyze,
    Transform,
    Both,
}

pub struct UseExtractedVisitor {
    pub mode: TraversalMode,
    pub hook_local_name: Option<String>,
    pub scopes: ScopeStack,
    pub found_messages: Vec<ExtractedMessage>,
    pub file_path: Option<String>,
}

impl UseExtractedVisitor {
    pub fn new(mode: TraversalMode) -> Self {
        Self {
            mode,
            hook_local_name: None,
            scopes: ScopeStack::new(),
            found_messages: Vec::new(),
            file_path: None,
        }
    }

    fn should_transform(&self) -> bool {
        matches!(self.mode, TraversalMode::Transform | TraversalMode::Both)
    }

    fn should_collect(&self) -> bool {
        matches!(self.mode, TraversalMode::Analyze | TraversalMode::Both)
    }
}

impl VisitMut for UseExtractedVisitor {
    fn visit_mut_import_decl(&mut self, import: &mut ImportDecl) {
        if import.src.value == "next-intl" {
            for spec in &mut import.specifiers {
                if let ImportSpecifier::Named(named_spec) = spec {
                    if let Some(imported) = &mut named_spec.imported {
                        if let ModuleExportName::Ident(ident) = imported {
                            if ident.sym == "useExtracted" {
                                if self.should_transform() {
                                    ident.sym = "useTranslations".into();
                                }
                                self.hook_local_name = Some(named_spec.local.sym.to_string());
                            }
                        }
                    } else if named_spec.local.sym == "useExtracted" {
                        if self.should_transform() {
                            // Remember original local before renaming
                            let original = named_spec.local.sym.to_string();
                            named_spec.local.sym = "useTranslations".into();
                            self.hook_local_name = Some(original);
                        } else {
                            self.hook_local_name = Some("useExtracted".into());
                        }
                    }
                }
            }
        }

        import.visit_mut_children_with(self);
    }

    fn visit_mut_var_decl(&mut self, var_decl: &mut VarDecl) {
        for decl in &mut var_decl.decls {
            if let Pat::Ident(ident) = &decl.name {
                if let Some(init) = &mut decl.init {
                    if let Expr::Call(call_expr) = &mut **init {
                        if let Callee::Expr(expr) = &mut call_expr.callee {
                            if let Expr::Ident(func_ident) = &mut **expr {
                                let matches_hook = if let Some(hook) = &self.hook_local_name {
                                    &*func_ident.sym == hook
                                } else {
                                    &*func_ident.sym == "useExtracted"
                                };
                                if matches_hook {
                                    self.scopes.define(&ident.id.sym.to_string(), "translator");
                                    if self.should_transform() {
                                        func_ident.sym = "useTranslations".into();
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        var_decl.visit_mut_children_with(self);
    }

    fn visit_mut_call_expr(&mut self, call: &mut CallExpr) {
        if let Callee::Expr(expr) = &call.callee {
            if let Expr::Ident(ident) = &**expr {
                if let Some(kind) = self.scopes.lookup(&ident.sym.to_string()) {
                    if kind == "translator" {
                        if let Some(first_arg) = call.args.first_mut() {
                            if let Expr::Lit(Lit::Str(str_lit)) = &mut *first_arg.expr {
                                let message_text = str_lit.value.to_string();
                                if self.should_collect() {
                                    let id = generate_key(&message_text);
                                    self.found_messages.push(ExtractedMessage {
                                        id,
                                        message: message_text.clone(),
                                        description: None,
                                        file_path: self.file_path.clone(),
                                        line: None,
                                        column: None,
                                    });
                                }
                                if self.should_transform() {
                                    let key = generate_key(&message_text);
                                    str_lit.value = key.into();
                                    str_lit.raw = None;
                                }
                            }
                        }
                    }
                }
            }
        }

        call.visit_mut_children_with(self);
    }

    fn visit_mut_block_stmt(&mut self, n: &mut BlockStmt) {
        self.scopes.push_scope();
        n.visit_mut_children_with(self);
        self.scopes.pop_scope();
    }

    fn visit_mut_function(&mut self, n: &mut Function) {
        self.scopes.push_scope();
        n.visit_mut_children_with(self);
        self.scopes.pop_scope();
    }

    fn visit_mut_arrow_expr(&mut self, n: &mut ArrowExpr) {
        self.scopes.push_scope();
        n.visit_mut_children_with(self);
        self.scopes.pop_scope();
    }
}
