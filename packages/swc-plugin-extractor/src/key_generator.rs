use base64::Engine;
use sha2::{Digest, Sha512};
use swc_atoms::Wtf8Atom;

pub struct KeyGenerator;

impl KeyGenerator {
    pub fn generate(message: &Wtf8Atom) -> String {
        let hash = Sha512::digest(message.as_bytes());
        let base64 = base64::engine::general_purpose::STANDARD.encode(hash);
        base64[..6].to_string()
    }
}
