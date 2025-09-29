use base64::{engine::general_purpose, Engine as _};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha512};

/// A simple message structure for demonstration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub id: String,
    pub default_message: String,
    pub description: Option<String>,
}

pub fn generate_key(message: &str) -> String {
    let mut hasher = Sha512::new();
    hasher.update(message.as_bytes());
    let hash = hasher.finalize();
    let base64 = general_purpose::STANDARD.encode(&hash);
    base64.chars().take(6).collect()
}
