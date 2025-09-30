use crate::traversal::{TraversalMode, UseExtractedVisitor};
use swc_core::common::BytePos;
use swc_core::ecma::{
    ast::EsVersion,
    parser::{lexer::Lexer, Parser, StringInput, Syntax, TsSyntax},
    visit::VisitMutWith,
};

#[test]
fn extract_messages() {
    let source_code = r#"
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
    let actual = serde_json::to_string_pretty(&visitor.found_messages)
        .expect("Failed to serialize messages");

    let expected = r#"[
  {
    "id": "+1F2If",
    "message": "Successfully sent!",
    "description": null,
    "file_path": "test.tsx",
    "line": null,
    "column": null
  },
  {
    "id": "9WRlF4",
    "message": "Send",
    "description": null,
    "file_path": "test.tsx",
    "line": null,
    "column": null
  }
]"#;

    assert_eq!(actual, expected);
}
