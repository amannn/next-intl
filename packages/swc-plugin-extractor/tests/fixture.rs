use std::path::PathBuf;
use std::sync::{Arc, Mutex};

use swc_common::Mark;
use swc_core::{
    common::{
        sync::Lrc, BytePos, FileName, Loc, SourceMap, SourceMapper, Span,
    },
    common::source_map::{FileLinesResult, SpanSnippetError},
    ecma::{
        parser::{EsSyntax, Syntax},
        transforms::{
            base::resolver,
            testing::{test_fixture, FixtureTestConfig},
        },
    },
};
use swc_ecma_ast::Pass;
use swc_ecma_visit::visit_mut_pass;
use swc_plugin_extractor::{StrictExtractedMessage, TransformVisitor};

#[derive(Clone)]
struct SourceMapWrapper(Lrc<SourceMap>);

impl SourceMapper for SourceMapWrapper {
    fn lookup_char_pos(&self, pos: BytePos) -> Loc {
        self.0.lookup_char_pos(pos)
    }
    fn span_to_lines(&self, sp: Span) -> FileLinesResult {
        self.0.span_to_lines(sp)
    }
    fn span_to_string(&self, sp: Span) -> String {
        self.0.span_to_string(sp)
    }
    fn span_to_filename(&self, sp: Span) -> Arc<FileName> {
        self.0.span_to_filename(sp)
    }
    fn merge_spans(&self, sp_lhs: Span, sp_rhs: Span) -> Option<Span> {
        self.0.merge_spans(sp_lhs, sp_rhs)
    }
    fn call_span_if_macro(&self, sp: Span) -> Span {
        self.0.call_span_if_macro(sp)
    }
    fn doctest_offset_line(&self, line: usize) -> usize {
        self.0.doctest_offset_line(line)
    }
    fn span_to_snippet(&self, sp: Span) -> Result<String, Box<SpanSnippetError>> {
        self.0.span_to_snippet(sp)
    }
}

fn tr(results: Arc<Mutex<Vec<StrictExtractedMessage>>>, cm: Lrc<SourceMap>) -> impl Pass {
    let unresolved_mark = Mark::new();
    let top_level_mark = Mark::new();

    (
        resolver(unresolved_mark, top_level_mark, false),
        visit_mut_pass(TransformVisitor::new(
            true,
            "input.js".to_string(),
            Some(SourceMapWrapper(cm)),
            Some(results),
        )),
    )
}

#[testing::fixture("tests/fixture/**/input.js")]
fn test(input: PathBuf) {
    let dir = input.parent().unwrap().to_path_buf();
    let output = dir.join("output.js");
    let output_json = dir.join("output.json");

    let results = Arc::new(Mutex::new(Vec::new()));
    let results_clone = results.clone();

    test_fixture(
        Syntax::Es(EsSyntax {
            jsx: true,
            ..Default::default()
        }),
        &|t| tr(results_clone.clone(), t.cm.clone()),
        &input,
        &output,
        FixtureTestConfig {
            sourcemap: true,
            allow_error: true,
            ..Default::default()
        },
    );

    let results = results.lock().unwrap();
    let mut json = serde_json::to_string_pretty(&*results).unwrap();
    json.push('\n'); // Add trailing newline

    // Normalize newlines
    let json = json.replace("\r\n", "\n");

    if output_json.exists() {
        let expected = std::fs::read_to_string(&output_json)
            .unwrap()
            .replace("\r\n", "\n");
        
        // Use pretty assertions if available, otherwise standard assert
        assert_eq!(json, expected, "output.json does not match for {:?}", input);
    } else {
        std::fs::write(&output_json, json).unwrap();
    }
}
