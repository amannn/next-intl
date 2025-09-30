use crate::traversal::{TraversalMode, UseExtractedVisitor};
use swc_core::ecma::{
    parser::{EsSyntax, Syntax},
    transforms::testing::test_inline,
    visit::visit_mut_pass,
};

test_inline!(
    Default::default(),
    |_| visit_mut_pass(UseExtractedVisitor::new(TraversalMode::Transform)),
    simple,
    r#"
import {useExtracted} from 'next-intl';

function Component() {
    const t = useExtracted();
    t("Hey!");
}
    "#,
    r#"
import {useTranslations} from 'next-intl';

function Component() {
    const t = useTranslations();
    t("+YJVTi");
}
    "#
);

test_inline!(
    Default::default(),
    |_| visit_mut_pass(UseExtractedVisitor::new(TraversalMode::Transform)),
    with_let,
    r#"
import {useExtracted} from 'next-intl';

function Component() {
    let t = useExtracted();
    t("Hey!");
}
    "#,
    r#"
import {useTranslations} from 'next-intl';

function Component() {
    let t = useTranslations();
    t("+YJVTi");
}
    "#
);

test_inline!(
    Default::default(),
    |_| visit_mut_pass(UseExtractedVisitor::new(TraversalMode::Transform)),
    renamed_var,
    r#"
import {useExtracted} from 'next-intl';

function Component() {
    const translate = useExtracted();
    translate("Hello!");
}
    "#,
    r#"
import {useTranslations} from 'next-intl';

function Component() {
    const translate = useTranslations();
    translate("OpKKos");
}
    "#
);

test_inline!(
    Default::default(),
    |_| visit_mut_pass(UseExtractedVisitor::new(TraversalMode::Transform)),
    use_translations_already_present,
    r#"
import {useExtracted, useTranslations} from 'next-intl';

function Component() {
    const t = useExtracted();
    const t2 = useTranslations();
    t("Hello from extracted!");
    t2("greeting");
}
    "#,
    // Note: This is not ideal (duplicate import), but Turbopack
    // works fine with this and it's very uncommon anyway.
    r#"
import {useTranslations, useTranslations} from 'next-intl';

function Component() {
    const t = useTranslations();
    const t2 = useTranslations();
    t("piskIR");
    t2("greeting");
}
    "#
);

test_inline!(
    Default::default(),
    |_| visit_mut_pass(UseExtractedVisitor::new(TraversalMode::Transform)),
    t_out_of_scope,
    r#"
import {useExtracted} from 'next-intl';

function Component() {
    const t = useExtracted();
    t("Hey!");
}

const t = (msg) => msg;
t("Should not be transformed");
    "#,
    r#"
import {useTranslations} from 'next-intl';

function Component() {
    const t = useTranslations();
    t("+YJVTi");
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
    real_world,
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
    renamed,
    r#"
import {useExtracted as useInlined} from 'next-intl';

function Component() {
    const t = useInlined();
    t("Hey!");
}
    "#,
    r#"
import {useTranslations} from 'next-intl';

function Component() {
    const t = useTranslations();
    t("+YJVTi");
}
    "#
);
