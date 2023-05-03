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
        process.env.NODE_ENV !== 'production'
          ? `Namespace keys can not contain the character "." as this is used to express nesting. Please remove it or replace it with another character.

Invalid ${
              invalidKeyLabels.length === 1 ? 'key' : 'keys'
            }: ${invalidKeyLabels.join(', ')}

If you're migrating from a flat structure, you can convert your messages as follows:

import {set} from "lodash";

const input = {
  "one.one": "1.1",
  "one.two": "1.2",
  "two.one.one": "2.1.1"
};

const output = Object.entries(input).reduce(
  (acc, [key, value]) => set(acc, key, value),
  {}
);

// Output:
//
// {
//   "one": {
//     "one": "1.1",
//     "two": "1.2"
//   },
//   "two": {
//     "one": {
//       "one": "2.1.1"
//     }
//   }
// }
`
          : undefined
      )
    );
  }
}
