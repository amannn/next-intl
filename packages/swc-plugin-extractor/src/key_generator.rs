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

#[test]
fn generates_unique_ids_for_same_message_with_different_descriptions() {
    let message = Wtf8Atom::from("Click here");
    let desc1 = Wtf8Atom::from("Button label on homepage banner");
    let desc2 = Wtf8Atom::from("Link label in footer navigation");

    // Generate keys using KeyGenerator::generate
    let key1 = KeyGenerator::generate(&message, Some(&desc1));
    let key2 = KeyGenerator::generate(&message, Some(&desc2));

    // 1. Verify that keys/IDs do NOT collide
    assert_ne!(
        key1, key2,
        "Key generator produced identical keys ('{}') for different descriptions!",
        key1
    );

    // 2. Verify both keys are non-empty
    assert!(!key1.is_empty(), "Key 1 should not be empty");
    assert!(!key2.is_empty(), "Key 2 should not be empty");
}
