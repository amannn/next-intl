use std::cell::RefCell;
use std::fs;
use std::path::PathBuf;
use std::rc::Rc;

use serde_json::Value;
use swc_common::{FileName, Globals, Mark, SourceMap, GLOBALS};
use swc_core::ecma::{
    parser::{lexer::Lexer, EsSyntax, Parser, StringInput, Syntax},
    transforms::{
        base::resolver,
        testing::{test_fixture, FixtureTestConfig},
    },
};
use swc_ecma_ast::{EsVersion, Pass};
use swc_ecma_visit::VisitMutWith;
use swc_plugin_extractor::TransformVisitor;

struct VisitorPass {
    visitor: Rc<RefCell<TransformVisitor>>,
}

impl Pass for VisitorPass {
    fn process(&mut self, program: &mut swc_ecma_ast::Program) {
        program.visit_mut_with(&mut *self.visitor.borrow_mut());
    }
}

fn tr(visitor_rc: Rc<RefCell<TransformVisitor>>) -> impl Pass {
    let unresolved_mark = Mark::new();
    let top_level_mark = Mark::new();

    (
        resolver(unresolved_mark, top_level_mark, false),
        VisitorPass {
            visitor: visitor_rc,
        },
    )
}

fn parse(cm: &SourceMap, code: &str) -> swc_ecma_ast::Program {
    let fm = cm.new_source_file(FileName::Anon.into(), code.to_string());
    let lexer = Lexer::new(
        Syntax::Es(EsSyntax {
            jsx: true,
            ..Default::default()
        }),
        EsVersion::EsNext,
        StringInput::from(&*fm),
        None,
    );
    let mut parser = Parser::new_from(lexer);
    parser.parse_program().unwrap()
}

#[testing::fixture("tests/fixture/**/input.js")]
fn test(input: PathBuf) {
    let dir = input.parent().unwrap().to_path_buf();
    let output = dir.join("output.js");
    let output_json = dir.join("output.json");

    let visitor = TransformVisitor::new(true, "input.js".to_string(), None);
    let visitor_rc = Rc::new(RefCell::new(visitor));

    // Test JS transformation
    test_fixture(
        Syntax::Es(EsSyntax {
            jsx: true,
            ..Default::default()
        }),
        &|_| tr(visitor_rc.clone()),
        &input,
        &output,
        FixtureTestConfig {
            sourcemap: true,
            allow_error: true,
            ..Default::default()
        },
    );

    // Test JSON output - run transformation again with SourceMap for accurate line numbers
    let globals = Globals::new();
    GLOBALS.set(&globals, || {
        let code = fs::read_to_string(&input).unwrap();
        let cm = SourceMap::default();
        let mut program = parse(&cm, &code);

        if !program.is_module() {
            panic!("Parsed as script, expected module");
        }

        let unresolved_mark = Mark::new();
        let top_level_mark = Mark::new();

        program.visit_mut_with(&mut resolver(unresolved_mark, top_level_mark, false));

        let file_name = input.file_name().unwrap().to_string_lossy().to_string();
        // Use the same SourceMap that was used for parsing so spans match
        let mut visitor = TransformVisitor::new(
            true,
            file_name,
            Some(Box::new(cm) as Box<dyn swc_core::common::SourceMapper>),
        );

        program.visit_mut_with(&mut visitor);

        // Use results directly from visitor - it calculates line numbers correctly with SourceMap
        let actual_results = visitor.get_results();
        let actual_json: Value = serde_json::to_value(&actual_results).unwrap();

        let expected_json_str = fs::read_to_string(&output_json)
            .unwrap_or_else(|_| panic!("Expected output.json not found at {:?}", output_json));
        let expected_json: Value = serde_json::from_str(&expected_json_str)
            .unwrap_or_else(|_| panic!("Failed to parse expected JSON at {:?}", output_json));

        if actual_json != expected_json {
            panic!(
                "JSON output mismatch.\nExpected:\n{}\nActual:\n{}",
                serde_json::to_string_pretty(&expected_json).unwrap(),
                serde_json::to_string_pretty(&actual_json).unwrap()
            );
        }
    });
}
