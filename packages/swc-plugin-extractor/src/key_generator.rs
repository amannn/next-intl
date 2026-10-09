use base64::Engine;
use sha2::{Digest, Sha512};
use swc_atoms::Wtf8Atom;

pub struct KeyGenerator;

impl KeyGenerator {
    pub fn generate(message: &Wtf8Atom, description: Option<&Wtf8Atom>) -> String {
        let mut hasher = Sha512::new();
        hasher.update(message.as_bytes());

        if let Some(desc) = description {
            hasher.update(b"\0");
            hasher.update(desc.as_bytes());
        }

        let hash = hasher.finalize();

        // URL_SAFE_NO_PAD uses `-_` instead of `+/`. The standard base64
        // alphabet can produce keys starting with `/`, which Googlebot
        // interprets as relative URL paths when they appear in serialised
        // page data and reports as 404s in Search Console (see #2250).
        let base64 = base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(hash);
        base64[..6].to_string()
    }
}
