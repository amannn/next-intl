use crate::TransformVisitor;
use swc_core::ecma::{transforms::testing::test_inline, visit::visit_mut_pass};

// Test the message extraction and transformation
test_inline!(
    Default::default(),
    |_| visit_mut_pass(TransformVisitor::new()),
    extract_use_extracted,
    // Input codes
    r#"import {useExtracted} from 'next-intl'; const t = useExtracted(); t("Hey from server!");"#,
    // Output codes after transformed with plugin
    r#"import {useTranslations} from 'next-intl'; const t = useTranslations(); t("mwFebS");"#
);
