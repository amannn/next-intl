use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ExtractedMessage {
    pub id: String,
    pub message: String,
    pub description: Option<String>,
    pub file_path: Option<String>,
}
