use napi_derive::napi;
use next_intl_shared::{Message, TraversalMode, UseExtractedVisitor};
use rayon::prelude::*;
use swc_core::common::BytePos;
use swc_core::ecma::ast::EsVersion;
use swc_core::ecma::parser::{lexer::Lexer, Parser, StringInput, Syntax, TsSyntax};
use swc_core::ecma::visit::VisitMutWith;
use walkdir::WalkDir;

/// Extract messages from a single file
#[napi]
pub async fn extract_file_messages(
    absolute_file_path: String,
) -> napi::Result<Vec<ExtractedMessage>> {
    let content = tokio::fs::read_to_string(&absolute_file_path)
        .await
        .map_err(|err| napi::Error::from_reason(format!("Failed to read file: {}", err)))?;

    extract_messages_internal(content, absolute_file_path)
}

/// Load and extract messages from all source files in a directory
/// This is highly optimized for batch processing with parallel I/O and CPU utilization
#[napi]
pub async fn load_source_messages(
    src_path: String,
    extensions: Vec<String>,
    ignore_folders: Vec<String>,
) -> napi::Result<Vec<FileMessages>> {
    // Step 1: Collect all matching file paths (fast, synchronous)
    let file_paths = tokio::task::spawn_blocking(move || {
        collect_source_files(&src_path, &extensions, &ignore_folders)
    })
    .await
    .map_err(|err| napi::Error::from_reason(format!("Failed to scan files: {}", err)))??;

    // Step 2: Read all files concurrently (I/O bound)
    let file_contents: Vec<(String, String)> = {
        let tasks: Vec<_> = file_paths
            .into_iter()
            .map(|path| async move {
                let content = tokio::fs::read_to_string(&path).await;
                (path, content)
            })
            .collect();

        futures::future::join_all(tasks)
            .await
            .into_iter()
            .filter_map(|(path, result)| result.ok().map(|content| (path, content)))
            .collect()
    };

    // Step 3: Process files in parallel using all CPU cores (CPU bound)
    let results: Vec<FileMessages> = file_contents
        .into_par_iter()
        .map(|(file_path, content)| {
            let messages =
                extract_messages_internal(content, file_path.clone()).unwrap_or_default();
            FileMessages {
                file_path,
                messages,
            }
        })
        .collect();

    Ok(results)
}

fn extract_messages_internal(
    source: String,
    file_path: String,
) -> napi::Result<Vec<ExtractedMessage>> {
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
    visitor.file_path = Some(file_path);
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

/// Result of file message extraction
#[napi(object)]
pub struct FileMessages {
    #[napi(js_name = "filePath")]
    pub file_path: String,
    pub messages: Vec<ExtractedMessage>,
}

/// Collect all source files matching the criteria
fn collect_source_files(
    src_path: &str,
    extensions: &[String],
    ignore_folders: &[String],
) -> napi::Result<Vec<String>> {
    let mut files = Vec::new();

    for entry in WalkDir::new(src_path)
        .follow_links(false)
        .into_iter()
        .filter_entry(|e| {
            // Filter out ignored folders
            if e.file_type().is_dir() {
                let dir_name = e.file_name().to_string_lossy();
                !ignore_folders
                    .iter()
                    .any(|ignore| dir_name == ignore.as_str())
            } else {
                true
            }
        })
    {
        let entry = entry.map_err(|err| {
            napi::Error::from_reason(format!("Failed to read directory entry: {}", err))
        })?;

        if entry.file_type().is_file() {
            let path = entry.path();
            if let Some(ext) = path.extension() {
                let ext_str = format!(".{}", ext.to_string_lossy());
                if extensions.iter().any(|e| e == &ext_str) {
                    if let Some(path_str) = path.to_str() {
                        files.push(path_str.to_string());
                    }
                }
            }
        }
    }

    Ok(files)
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
