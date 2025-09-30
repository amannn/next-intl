use next_intl_shared::{TraversalMode, UseExtractedVisitor};
use swc_core::common::BytePos;
use swc_core::ecma::ast::EsVersion;
use swc_core::ecma::parser::{lexer::Lexer, Parser, StringInput, Syntax, TsSyntax};
use swc_core::ecma::visit::VisitMutWith;

use crate::types::ExtractedMessage;

/// Extract messages from source code
pub fn extract_file_content_messages(
    source: String,
    file_path: String,
) -> napi::Result<Vec<ExtractedMessage>> {
    // Shortcut: Avoid parsing if hook is not mentioned
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

    let input = StringInput::new(&source, BytePos(0), BytePos(source.len() as u32));
    let lexer = Lexer::new(syntax, EsVersion::EsNext, input, None);
    let mut parser = Parser::new_from(lexer);

    let mut module = parser
        .parse_module()
        .map_err(|err| napi::Error::from_reason(format!("Parse error: {:?}", err)))?;

    let mut visitor = UseExtractedVisitor::new(TraversalMode::Analyze);
    visitor.file_path = Some(file_path);
    module.visit_mut_with(&mut visitor);

    Ok(visitor.found_messages.into_iter().map(Into::into).collect())
}
