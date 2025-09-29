use napi_derive::napi;
use next_intl_shared::{generate_key, Message};

/// Extract messages from source code
#[napi]
pub fn extract_messages(_source: String) -> napi::Result<Vec<ExtractedMessage>> {
    let default_message = "Hello world";
    let id = generate_key(default_message);
    let message = ExtractedMessage {
        id,
        default_message: default_message.to_string(),
        description: Some("A hardcoded example message".to_string()),
    };
    Ok(vec![message])
}

/// NAPI-compatible message structure
#[napi(object)]
pub struct ExtractedMessage {
    pub id: String,
    #[napi(js_name = "defaultMessage")]
    pub default_message: String,
    pub description: Option<String>,
}

impl From<Message> for ExtractedMessage {
    fn from(message: Message) -> Self {
        Self {
            id: message.id,
            default_message: message.default_message,
            description: message.description,
        }
    }
}

impl From<ExtractedMessage> for Message {
    fn from(message: ExtractedMessage) -> Self {
        Self {
            id: message.id,
            default_message: message.default_message,
            description: message.description,
        }
    }
}
