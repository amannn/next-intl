use base64::Engine;
use sha2::{Digest, Sha512};
use swc_atoms::Wtf8Atom;

// The separator gettext uses between `msgctxt` and `msgid`.
const DESCRIPTION_SEPARATOR: &[u8] = b"\x04";

pub struct KeyGenerator;

impl KeyGenerator {
    /// An empty or missing `description` leaves the key of the message unchanged.
    pub fn generate(message: &Wtf8Atom, description: Option<&Wtf8Atom>) -> String {
        let mut hasher = Sha512::new();
        hasher.update(message.as_bytes());
        if let Some(description) = description.filter(|value| !value.as_bytes().is_empty()) {
            hasher.update(DESCRIPTION_SEPARATOR);
            hasher.update(description.as_bytes());
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
