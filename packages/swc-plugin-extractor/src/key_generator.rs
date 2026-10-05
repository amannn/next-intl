use base64::Engine;
use sha2::{Digest, Sha512};
use swc_atoms::Wtf8Atom;

pub struct KeyGenerator;

impl KeyGenerator {
    pub fn generate(message: &Wtf8Atom, description: Option<&Wtf8Atom>) -> String {
        let input = match description {
            Some(d) if !d.is_empty() => format!(
                "{}:{}",
                message.as_str().unwrap_or_default(),
                d.as_str().unwrap_or_default()
            ),
            _ => message.as_str().unwrap_or_default().to_string(),
        };

        let hash = Sha512::digest(input.as_bytes());
        // URL_SAFE_NO_PAD uses `-_` instead of `+/`. The standard base64
        // alphabet can produce keys starting with `/`, which Googlebot
        // interprets as relative URL paths when they appear in serialised
        // page data and reports as 404s in Search Console (see #2250).
        let base64 = base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(hash);
        base64[..6].to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_known_key_output() {
        let message = Wtf8Atom::from("Hello");
        let description = Some(Wtf8Atom::from("Greeting"));

        let key = KeyGenerator::generate(&message, description.as_ref());

        // Asserts parity with TypeScript generateKey in MessageExtractor.test.tsx
        assert_eq!(key, "QrEapY");
    }

    #[test]
    fn generates_unique_ids_for_same_message_with_different_descriptions() {
        let msg = Wtf8Atom::from("Save");
        let desc1 = Some(Wtf8Atom::from("Form button"));
        let desc2 = Some(Wtf8Atom::from("Settings header"));

        let key1 = KeyGenerator::generate(&msg, desc1.as_ref());
        let key2 = KeyGenerator::generate(&msg, desc2.as_ref());

        assert_ne!(key1, key2);
    }
}
