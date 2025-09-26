use crate::TransformVisitor;
use swc_core::ecma::{transforms::testing::test_inline, visit::visit_mut_pass};

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
