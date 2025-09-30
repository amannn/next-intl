use crate::traversal::{TraversalMode, UseExtractedVisitor};
use swc_core::ecma::{transforms::testing::test_inline, visit::visit_mut_pass};

// things to test:
// - local rename of useExtracted
// - const t =, but also let, var
// - is order guaranteed?, for use_extracted_vars
// - only t calls that are in scope of the original hook call

test_inline!(
    Default::default(),
    |_| visit_mut_pass(UseExtractedVisitor::new(TraversalMode::Transform)),
    transform_use_extracted,
    r#"
import {useExtracted} from 'next-intl';

function Component() {
    const t = useExtracted();
    t("Hey from server!");
}
    "#,
    r#"
import {useTranslations} from 'next-intl';

function Component() {
    const t = useTranslations();
    t("mwFebS");
}
    "#
);

test_inline!(
    Default::default(),
    |_| visit_mut_pass(UseExtractedVisitor::new(TraversalMode::Transform)),
    transform_use_extracted_renamed,
    r#"
import {useExtracted as useInlined} from 'next-intl';

function Component() {
    const t = useInlined();
    t("Hey from server!");
}
    "#,
    r#"
import {useTranslations} from 'next-intl';

function Component() {
    const t = useTranslations();
    t("mwFebS");
}
    "#
);
