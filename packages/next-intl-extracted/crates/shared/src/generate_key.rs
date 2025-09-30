use base64::{engine::general_purpose, Engine as _};
use sha2::{Digest, Sha512};

pub fn generate_key(message: &str) -> String {
    let mut hasher = Sha512::new();
    hasher.update(message.as_bytes());
    let hash = hasher.finalize();
    let base64 = general_purpose::STANDARD.encode(&hash);
    base64.chars().take(6).collect()
}
