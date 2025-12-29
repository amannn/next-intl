use std::path::PathBuf;

use swc_common::Mark;
use swc_core::ecma::{
    parser::{EsSyntax, Syntax},
    transforms::{
        base::resolver,
        testing::{test_fixture, FixtureTestConfig},
    },
};
use swc_ecma_ast::Pass;
use swc_ecma_visit::visit_mut_pass;
use swc_plugin_extractor::TransformVisitor;

fn tr() -> impl Pass {
    let unresolved_mark = Mark::new();
    let top_level_mark = Mark::new();

    (
        resolver(unresolved_mark, top_level_mark, false),
        visit_mut_pass(TransformVisitor::new(true, "input.js".to_string(), None)),
    )
}

#[testing::fixture("tests/fixture/**/input.js")]
fn test(input: PathBuf) {
    let dir = input.parent().unwrap().to_path_buf();
    let output = dir.join("output.js");

    test_fixture(
        Syntax::Es(EsSyntax {
            jsx: true,
            ..Default::default()
        }),
        &|_| tr(),
        &input,
        &output,
        FixtureTestConfig {
            sourcemap: true,
            allow_error: true,
            ..Default::default()
        },
    );
}
