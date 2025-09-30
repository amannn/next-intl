use walkdir::WalkDir;

/// Collect all source files matching the criteria
pub fn collect_source_files(
    src_path: &str,
    file_extensions: &[String],
    ignored_folder_names: &[String],
) -> napi::Result<Vec<String>> {
    let mut files = Vec::new();

    for entry in WalkDir::new(src_path)
        .follow_links(false)
        .into_iter()
        .filter_entry(|e| {
            // Filter out ignored folders
            if e.file_type().is_dir() {
                let dir_name = e.file_name().to_string_lossy();
                !ignored_folder_names
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
                if file_extensions.iter().any(|e| e == &ext_str) {
                    if let Some(path_str) = path.to_str() {
                        files.push(path_str.to_string());
                    }
                }
            }
        }
    }

    Ok(files)
}
