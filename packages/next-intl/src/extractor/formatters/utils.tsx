import type {ExtractedMessage} from '../types.js';

export function getSortedMessages(
  messages: Array<ExtractedMessage>
): Array<ExtractedMessage> {
  return messages.toSorted((a, b) => {
    const aPath = a.references?.[0]?.path ?? a.message;
    const bPath = b.references?.[0]?.path ?? b.message;
    if (aPath === bPath) {
      return a.message.localeCompare(b.message);
    } else {
      return aPath.localeCompare(bPath);
    }
  });
}
