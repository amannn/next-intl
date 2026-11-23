import type {ExtractorMessage} from '@eloqnt/messages/_internal';
import type {SourceExtractedMessage} from '../types.js';
import {compareReferences} from '../utils.js';

// Source code is the source of truth for these fields, only ancillary codec
// fields may merge from disk (e.g. flags)
const extractorOwnedKeys = new Set<string>([
  'description',
  'id',
  'message',
  'references'
]);

export function isExtractorOwnedKey(key: string): boolean {
  return extractorOwnedKeys.has(key);
}

export function groupSourceMessagesById(
  messages: Array<SourceExtractedMessage>
): Map<string, Array<SourceExtractedMessage>> {
  const result = new Map<string, Array<SourceExtractedMessage>>();
  for (const message of messages) {
    const messagesById = result.get(message.id);
    if (messagesById) {
      messagesById.push(message);
    } else {
      result.set(message.id, [message]);
    }
  }
  return result;
}

/**
 * Combines all uses of a message in the source code, in file order. Fields
 * that don't come from the source code are kept from `previous`.
 */
export function aggregateMessage(
  id: string,
  sourceMessages: Array<SourceExtractedMessage>,
  previous?: ExtractorMessage
): ExtractorMessage {
  const aggregate: ExtractorMessage = {
    description: mergeDescriptions(sourceMessages),
    id,
    message: sourceMessages[0].message,
    references: sourceMessages
      .map((message) => message.reference)
      .sort(compareReferences)
  };

  if (previous) {
    fillUnownedFields(aggregate, previous);
  }

  return aggregate;
}

function mergeDescriptions(
  messages: Array<SourceExtractedMessage>
): ExtractorMessage['description'] {
  const sortedByReference = messages.toSorted((a, b) =>
    compareReferences(a.reference, b.reference)
  );

  const merged: Array<string> = [];
  for (const message of sortedByReference) {
    const {description} = message;
    if (description != null && !merged.includes(description)) {
      merged.push(description);
    }
  }

  return merged;
}

/** Copies codec fields (e.g. flags) that `target` doesn't have yet. */
export function fillUnownedFields(
  target: ExtractorMessage,
  from: ExtractorMessage
): void {
  for (const key of Object.keys(from)) {
    if (!isExtractorOwnedKey(key) && target[key] == null) {
      target[key] = from[key];
    }
  }
}

/**
 * The messages of a locale's file: every source message, with the locale's
 * translation (or the source text for the source locale).
 */
export function getLocaleMessages(
  messagesById: Map<string, ExtractorMessage>,
  localeMessages: Map<string, ExtractorMessage> | undefined,
  isSourceLocale: boolean
): Array<ExtractorMessage> {
  return Array.from(messagesById.values()).map((message) => {
    const localeMessage = localeMessages?.get(message.id);
    return {
      ...localeMessage,
      id: message.id,
      description: message.description,
      references: message.references,
      message: isSourceLocale ? message.message : (localeMessage?.message ?? '')
    };
  });
}
