use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub id: String,
    pub message: String,
    pub description: Option<String>,
    pub file_path: Option<String>,
    pub line: Option<u32>,
    pub column: Option<u32>,
}


