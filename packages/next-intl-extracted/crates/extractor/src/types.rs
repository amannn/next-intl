use napi_derive::napi;
use next_intl_shared::ExtractedMessage as InternalExtractedMessage;

/// An extracted message with JavaScript-friendly field names
#[napi(object)]
pub struct ExtractedMessage {
    pub id: String,
    pub message: String,
    pub description: Option<String>,
    #[napi(js_name = "filePath")]
    pub file_path: Option<String>,
}

impl From<InternalExtractedMessage> for ExtractedMessage {
    fn from(msg: InternalExtractedMessage) -> Self {
        Self {
            id: msg.id,
            message: msg.message,
            description: msg.description,
            file_path: msg.file_path,
        }
    }
}

/// Result of file message extraction
#[napi(object)]
pub struct ExtractedFileMessages {
    #[napi(js_name = "filePath")]
    pub file_path: String,
    pub messages: Vec<ExtractedMessage>,
}
