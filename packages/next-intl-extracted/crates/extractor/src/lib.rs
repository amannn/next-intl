use napi_derive::napi;
use next_intl_shared::{extract_messages, hello_world, process_messages, Message};

/// Hello world function exposed to Node.js
#[napi]
pub fn hello_world_napi() -> String {
    hello_world()
}

/// Extract messages from source code
#[napi]
pub fn extract_messages_napi(source: String) -> napi::Result<Vec<ExtractedMessage>> {
    let messages = extract_messages(&source)
        .map_err(|e| napi::Error::new(napi::Status::GenericFailure, format!("{}", e)))?;

    Ok(messages.into_iter().map(ExtractedMessage::from).collect())
}

/// Process messages and return JSON string
#[napi]
pub fn process_messages_napi(messages: Vec<ExtractedMessage>) -> napi::Result<String> {
    let rust_messages: Vec<Message> = messages.into_iter().map(Message::from).collect();
    let result = process_messages(&rust_messages)
        .map_err(|e| napi::Error::new(napi::Status::GenericFailure, format!("{}", e)))?;

    Ok(result)
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hello_world_napi() {
        assert_eq!(hello_world_napi(), "Hello from next-intl-shared!");
    }

    #[test]
    fn test_extract_messages_napi() {
        let source = "const t = useTranslations(); t('hello_world')";
        let result = extract_messages_napi(source.to_string()).unwrap();
        assert_eq!(result.len(), 1);
        assert_eq!(result[0].id, "hello_world");
    }

    #[test]
    fn test_process_messages_napi() {
        let messages = vec![ExtractedMessage {
            id: "test".to_string(),
            default_message: "Test message".to_string(),
            description: None,
        }];
        let result = process_messages_napi(messages).unwrap();
        assert!(result.contains("test"));
    }
}
