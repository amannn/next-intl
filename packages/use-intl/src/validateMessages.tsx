import AbstractIntlMessages from './AbstractIntlMessages';
import IntlError, {IntlErrorCode} from './IntlError';

function validateMessagesSegment(
  messages: AbstractIntlMessages,
  invalidKeyLabels: Array<string>,
  parentPath?: string
) {
  Object.entries(messages).forEach(([key, messageOrMessages]) => {
    if (key.includes('.')) {
      let keyLabel = key;
      if (parentPath) keyLabel += ` (at ${parentPath})`;
      invalidKeyLabels.push(keyLabel);
    }

    if (messageOrMessages != null && typeof messageOrMessages === 'object') {
      validateMessagesSegment(
        messageOrMessages,
        invalidKeyLabels,
        [parentPath, key].filter((part) => part != null).join('.')
      );
    }
  });
}

export default function validateMessages(
  messages: AbstractIntlMessages,
  onError: (error: IntlError) => void
) {
  const invalidKeyLabels: Array<string> = [];
  validateMessagesSegment(messages, invalidKeyLabels);

  if (invalidKeyLabels.length > 0) {
    onError(
      new IntlError(
        IntlErrorCode.INVALID_KEY,
        `Namespace keys can not contain the character "." as this is used to express nesting. Please remove it or replace it with another character.\n\nInvalid ${
          invalidKeyLabels.length === 1 ? 'key' : 'keys'
        }: ${invalidKeyLabels.join(', ')}`
      )
    );
  }
}
