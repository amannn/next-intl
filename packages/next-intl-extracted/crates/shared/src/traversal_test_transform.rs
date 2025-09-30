use crate::traversal::{TraversalMode, UseExtractedVisitor};
use swc_core::ecma::{
    parser::{EsSyntax, Syntax},
    transforms::testing::test_inline,
    visit::visit_mut_pass,
};

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
    transform_use_extracted_with_let,
    r#"
import {useExtracted} from 'next-intl';

function Component() {
    let t = useExtracted();
    t("Hey from server!");
}
    "#,
    r#"
import {useTranslations} from 'next-intl';

function Component() {
    let t = useTranslations();
    t("mwFebS");
}
    "#
);

test_inline!(
    Default::default(),
    |_| visit_mut_pass(UseExtractedVisitor::new(TraversalMode::Transform)),
    transform_use_extracted_t_out_of_scope,
    r#"
import {useExtracted} from 'next-intl';

function Component() {
    const t = useExtracted();
    t("Hey from server!");
}

const t = (msg) => msg;
t("Should not be transformed");
    "#,
    r#"
import {useTranslations} from 'next-intl';

function Component() {
    const t = useTranslations();
    t("mwFebS");
}

const t = (msg) => msg;
t("Should not be transformed");
    "#
);

test_inline!(
    Syntax::Es(EsSyntax {
        jsx: true,
        ..Default::default()
    }),
    |_| visit_mut_pass(UseExtractedVisitor::new(TraversalMode::Transform)),
    transform_use_extracted_complex,
    r#"
import {useState} from 'react';
import {useExtracted} from 'next-intl';

function Component() {
    const [notification, setNotification] = useState();
    const t = useExtracted();

    function onClick() {
        setNotification(t("Successfully sent!"));
    }

    return (
        <div>
            <button onClick={onClick}>
                {t("Send")}
            </button>
            {notification}
        </div>
    );
}
    "#,
    r#"
import {useState} from 'react';
import {useTranslations} from 'next-intl';

function Component() {
    const [notification, setNotification] = useState();
    const t = useTranslations();

    function onClick() {
        setNotification(t("+1F2If"));
    }

    return <div>
            <button onClick={onClick}>
                {t("9WRlF4")}
            </button>
            {notification}
        </div>;
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
