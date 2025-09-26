use base64::{engine::general_purpose, Engine as _};
use sha2::{Digest, Sha512};
use swc_core::ecma::{
    ast::{CallExpr, Callee, Expr, ImportDecl, ImportSpecifier, Lit, Pat, Program, VarDecl},
    visit::{VisitMut, VisitMutWith},
};
use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};

#[cfg(test)]
mod lib_test;

pub struct TransformVisitor {
    pub use_extracted_vars: Vec<String>, // Track variables from useExtracted()
}

impl TransformVisitor {
    pub fn new() -> Self {
        Self {
            use_extracted_vars: Vec::new(),
        }
    }
}

fn generate_key(message: &str) -> String {
    let mut hasher = Sha512::new();
    hasher.update(message.as_bytes());
    let hash = hasher.finalize();
    let base64 = general_purpose::STANDARD.encode(&hash);
    base64.chars().take(6).collect()
}

impl VisitMut for TransformVisitor {
    fn visit_mut_import_decl(&mut self, import: &mut ImportDecl) {
        // Transform: import {useExtracted} from 'next-intl';
        // To: import {useTranslations} from 'next-intl';
        if import.src.value == "next-intl" {
            for spec in &mut import.specifiers {
                if let ImportSpecifier::Named(named_spec) = spec {
                    if let Some(imported) = &mut named_spec.imported {
                        if let swc_core::ecma::ast::ModuleExportName::Ident(ident) = imported {
                            if ident.sym == "useExtracted" {
                                ident.sym = "useTranslations".into();
                            }
                        }
                    } else if named_spec.local.sym == "useExtracted" {
                        named_spec.local.sym = "useTranslations".into();
                    }
                }
            }
        }

        import.visit_mut_children_with(self);
    }
    fn visit_mut_var_decl(&mut self, var_decl: &mut VarDecl) {
        // Look for: const t = useExtracted();
        for decl in &mut var_decl.decls {
            if let Pat::Ident(ident) = &decl.name {
                if let Some(init) = &mut decl.init {
                    if let Expr::Call(call_expr) = &mut **init {
                        if let Callee::Expr(expr) = &mut call_expr.callee {
                            if let Expr::Ident(func_ident) = &mut **expr {
                                if func_ident.sym == "useExtracted" {
                                    // Track this variable as coming from useExtracted
                                    self.use_extracted_vars.push(ident.id.sym.to_string());

                                    // Transform useExtracted() to useTranslations()
                                    func_ident.sym = "useTranslations".into();
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
        // Check if this is a call from a useExtracted variable
        if let Callee::Expr(expr) = &call.callee {
            if let Expr::Ident(ident) = &**expr {
                if self.use_extracted_vars.contains(&ident.sym.to_string()) {
                    // This is a t() call from useExtracted
                    if let Some(first_arg) = call.args.first_mut() {
                        if let Expr::Lit(Lit::Str(str_lit)) = &mut *first_arg.expr {
                            let message = str_lit.value.to_string();
                            let key = generate_key(&message);

                            // Replace the message with the generated key
                            str_lit.value = key.into();
                            str_lit.raw = None;
                        }
                    }
                }
            }
        }

        call.visit_mut_children_with(self);
    }
}

#[plugin_transform]
pub fn process_transform(
    mut program: Program,
    _metadata: TransformPluginProgramMetadata,
) -> Program {
    let mut visitor = TransformVisitor::new();
    program.visit_mut_with(&mut visitor);
    program
}
