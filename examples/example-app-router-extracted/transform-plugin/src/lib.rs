use swc_core::ecma::{
    ast::{CallExpr, Callee, Expr, Lit, Program},
    transforms::testing::test_inline,
    visit::{VisitMut, VisitMutWith},
};
use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};

pub struct TransformVisitor;

impl VisitMut for TransformVisitor {
    fn visit_mut_call_expr(&mut self, call: &mut CallExpr) {
        // Check if this is a call to t()
        if let Callee::Expr(expr) = &call.callee {
            if let Expr::Ident(ident) = &**expr {
                if ident.sym == "t" {
                    // Check if the first argument is a string literal
                    if let Some(first_arg) = call.args.first_mut() {
                        if let Expr::Lit(Lit::Str(str_lit)) = &mut *first_arg.expr {
                            // Prepend "CHANGED: " to the string
                            let original_value = str_lit.value.to_string();
                            str_lit.value = format!("CHANGED: {}", original_value).into();
                            str_lit.raw = None; // Clear raw to force regeneration
                        }
                    }
                }
            }
        }
        
        // Continue visiting child nodes
        call.visit_mut_children_with(self);
    }
}

/// An example plugin function with macro support.
/// `plugin_transform` macro interop pointers into deserialized structs, as well
/// as returning ptr back to host.
///
/// It is possible to opt out from macro by writing transform fn manually
/// if plugin need to handle low-level ptr directly via
/// `__transform_plugin_process_impl(
///     ast_ptr: *const u8, ast_ptr_len: i32,
///     unresolved_mark: u32, should_enable_comments_proxy: i32) ->
///     i32 /*  0 for success, fail otherwise.
///             Note this is only for internal pointer interop result,
///             not actual transform result */`
///
/// This requires manual handling of serialization / deserialization from ptrs.
/// Refer swc_plugin_macro to see how does it work internally.
#[plugin_transform]
pub fn process_transform(mut program: Program, _metadata: TransformPluginProgramMetadata) -> Program {
    program.visit_mut_with(&mut TransformVisitor);
    program
}

// An example to test plugin transform.
// Recommended strategy to test plugin's transform is verify
// the Visitor's behavior, instead of trying to run `process_transform` with mocks
// unless explicitly required to do so.
test_inline!(
    Default::default(),
    |_| visit_mut_pass(TransformVisitor),
    transform_t_calls,
    // Input codes
    r#"t("Hey from server!");"#,
    // Output codes after transformed with plugin
    r#"t("CHANGED: Hey from server!");"#
);