import {localeCompare} from '../utils.js';
import type {ExtractedMessage} from '../types.js';

export function getSortedMessages(
  messages: Array<ExtractedMessage>
): Array<ExtractedMessage> {
  return messages.toSorted((messageA, messageB) => {
    const pathA = messageA.references?.[0]?.path ?? '';
    const pathB = messageB.references?.[0]?.path ?? '';

    if (pathA === pathB) {
      return localeCompare(messageA.id, messageB.id);
    } else {
      return localeCompare(pathA, pathB);
    }
  });
}
