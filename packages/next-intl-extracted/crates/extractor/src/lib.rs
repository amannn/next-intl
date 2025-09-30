mod parser;
mod scanner;
mod types;

use napi_derive::napi;
use rayon::prelude::*;

use parser::extract_file_content_messages;
use scanner::collect_source_files;
use types::{ExtractedFileMessages, ExtractedMessage};

/// Extract messages from a single file
#[napi]
pub async fn extract_file_messages(
    absolute_file_path: String,
) -> napi::Result<Vec<ExtractedMessage>> {
    let content = tokio::fs::read_to_string(&absolute_file_path)
        .await
        .map_err(|err| napi::Error::from_reason(format!("Failed to read file: {}", err)))?;

    extract_file_content_messages(content, absolute_file_path)
}

/// Load and extract messages from all source files in a directory
#[napi]
pub async fn load_source_messages(
    src_path: String,
    file_extensions: Vec<String>,
    ignored_folder_names: Vec<String>,
) -> napi::Result<Vec<ExtractedFileMessages>> {
    // Step 1: Collect all matching file paths (fast, synchronous)
    let file_paths = tokio::task::spawn_blocking(move || {
        collect_source_files(&src_path, &file_extensions, &ignored_folder_names)
    })
    .await
    .map_err(|err| napi::Error::from_reason(format!("Failed to scan files: {}", err)))??;

    // Step 2: Read all files concurrently (I/O-bound)
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

    // Step 3: Process files in parallel using all CPU cores (CPU-bound)
    let results: Vec<ExtractedFileMessages> = file_contents
        .into_par_iter()
        .map(|(file_path, content)| {
            let messages =
                extract_file_content_messages(content, file_path.clone()).unwrap_or_default();
            ExtractedFileMessages {
                file_path,
                messages,
            }
        })
        .collect();

    Ok(results)
}
