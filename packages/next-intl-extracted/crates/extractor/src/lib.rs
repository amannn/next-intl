use napi_derive::napi;
use next_intl_shared::{Message, TraversalMode, UseExtractedVisitor};
use swc_core::common::BytePos;
use swc_core::ecma::ast::EsVersion;
use swc_core::ecma::parser::{lexer::Lexer, Parser, StringInput, Syntax, TsSyntax};
use swc_core::ecma::visit::VisitMutWith;

/// Extract messages from source code
#[napi]
pub fn extract_messages(source: String) -> napi::Result<Vec<ExtractedMessage>> {
    // Quick shortcut: avoid parsing if hook is not mentioned
    if !source.contains("useExtracted") {
        return Ok(vec![]);
    }

    let syntax = Syntax::Typescript(TsSyntax {
        tsx: true,
        decorators: true,
        dts: false,
        no_early_errors: false,
        disallow_ambiguous_jsx_like: true,
    });

    // Avoid allocating SourceMap/File for performance; use direct string input
    let input = StringInput::new(&source, BytePos(0), BytePos(source.len() as u32));
    let lexer = Lexer::new(syntax, EsVersion::EsNext, input, None);
    let mut parser = Parser::new_from(lexer);

    let mut module = parser
        .parse_module()
        .map_err(|err| napi::Error::from_reason(format!("Parse error: {:?}", err)))?;

    let mut visitor = UseExtractedVisitor::new(TraversalMode::Analyze);
    // Optional: set file path for meta data
    visitor.file_path = Some("input.tsx".to_string());
    module.visit_mut_with(&mut visitor);

    let result: Vec<ExtractedMessage> =
        visitor.found_messages.into_iter().map(Into::into).collect();
    Ok(result)
}

/// NAPI-compatible message structure
#[napi(object)]
pub struct ExtractedMessage {
    pub id: String,
    pub message: String,
    pub description: Option<String>,
    #[napi(js_name = "filePath")]
    pub file_path: Option<String>,
    pub line: Option<u32>,
    pub column: Option<u32>,
}

impl From<Message> for ExtractedMessage {
    fn from(message: Message) -> Self {
        Self {
            id: message.id,
            message: message.message,
            description: message.description,
            file_path: message.file_path,
            line: message.line,
            column: message.column,
        }
    }
}

impl From<ExtractedMessage> for Message {
    fn from(message: ExtractedMessage) -> Self {
        Self {
            id: message.id,
            message: message.message,
            description: message.description,
            file_path: message.file_path,
            line: message.line,
            column: message.column,
        }
    }
}
