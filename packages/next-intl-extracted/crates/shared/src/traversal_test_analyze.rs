use crate::traversal::{TraversalMode, UseExtractedVisitor};
use swc_core::common::BytePos;
use swc_core::ecma::{
    ast::EsVersion,
    parser::{lexer::Lexer, Parser, StringInput, Syntax, TsSyntax},
    visit::VisitMutWith,
};

#[test]
fn extract_use_extracted() {
    let source_code = r#"
import {useExtracted} from 'next-intl';

const t = useExtracted();
t("Hey from server!");
    "#;

    let syntax = Syntax::Typescript(TsSyntax {
        tsx: true,
        decorators: true,
        dts: false,
        no_early_errors: false,
        disallow_ambiguous_jsx_like: true,
    });

    let input = StringInput::new(source_code, BytePos(0), BytePos(source_code.len() as u32));
    let lexer = Lexer::new(syntax, EsVersion::latest(), input, None);
    let mut parser = Parser::new_from(lexer);

    let mut module = parser.parse_module().expect("Failed to parse module");

    let mut visitor = UseExtractedVisitor::new(TraversalMode::Analyze);
    visitor.file_path = Some("test.tsx".to_string());
    module.visit_mut_with(&mut visitor);

    // Check that messages were extracted
    assert_eq!(visitor.found_messages.len(), 1);
    let extracted = &visitor.found_messages[0];
    assert_eq!(extracted.id, "mwFebS");
    assert_eq!(extracted.message, "Hey from server!");
    assert_eq!(extracted.file_path, Some("test.tsx".to_string()));
}
