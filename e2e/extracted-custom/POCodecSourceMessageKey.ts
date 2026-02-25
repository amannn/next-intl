/* eslint-disable @typescript-eslint/no-explicit-any */
import POParser from 'po-parser';
import type {Entry} from 'po-parser';
import {defineCodec} from 'next-intl/extractor';

type ExtractedMessage = {
  id: string;
  message: string;
  description?: string;
  references?: Entry['references'];
  /** Allows for additional properties like .po flags to be read and later written. */
  [key: string]: unknown;
};

export default defineCodec(() => {
  const DEFAULT_METADATA = {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Transfer-Encoding': '8bit',
    'X-Generator': 'next-intl'
  };

  const metadataByLocale = new Map();

  return {
    decode(content, context) {
      const catalog = POParser.parse(content);
      if (catalog.meta) {
        metadataByLocale.set(context.locale, catalog.meta);
      }
      const messages =
        catalog.messages || ([] as NonNullable<typeof catalog.messages>);

      return messages.map((msg) => {
        const {extractedComments, msgctxt, msgid, msgstr, ...rest} = msg;

        // Necessary to restore the ID
        if (!msgctxt) {
          throw new Error('msgctxt is required');
        }

        if (extractedComments && extractedComments.length > 1) {
          throw new Error(
            `Multiple extracted comments are not supported. Found ${extractedComments.length} comments for msgid "${msgid}".`
          );
        }

        return {
          ...rest,
          id: msgctxt,
          message: msgstr,
          ...(extractedComments &&
            extractedComments.length > 0 && {
              description: extractedComments[0]
            })
        };
      });
    },

    encode(messages, context) {
      const encodedMessages = getSortedMessages(messages).map((msg) => {
        const sourceMessage = context.sourceMessagesById.get(msg.id)?.message;
        if (!sourceMessage) {
          throw new Error(
            `Source message not found for id "${msg.id}" in locale "${context.locale}".`
          );
        }

        // Store the hashed ID in msgctxt so we can restore it during decode
        const {description, id, message, ...rest} = msg;
        return {
          ...(description && {extractedComments: [description]}),
          ...rest,
          msgctxt: id,
          msgid: sourceMessage,
          msgstr: message
        };
      });

      return POParser.serialize({
        meta: {
          Language: context.locale,
          ...DEFAULT_METADATA,
          ...metadataByLocale.get(context.locale)
        },
        messages: encodedMessages
      });
    },

    toJSONString(source, context) {
      const parsed = this.decode(source, context);
      const messagesObject = {};
      for (const message of parsed) {
        setNestedProperty(messagesObject, message.id, message.message);
      }
      return JSON.stringify(messagesObject);
    }
  };
});

// Essentialls lodash/set, but we avoid this dependency
function setNestedProperty(
  obj: Record<string, any>,
  keyPath: string,
  value: any
): void {
  const keys = keyPath.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (
      !(key in current) ||
      typeof current[key] !== 'object' ||
      current[key] === null
    ) {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
}

function getSortedMessages(
  messages: Array<ExtractedMessage>
): Array<ExtractedMessage> {
  return messages.toSorted((messageA, messageB) => {
    const refA = messageA.references?.[0];
    const refB = messageB.references?.[0];

    // No references: preserve original (extraction) order
    if (!refA || !refB) return 0;

    // Sort by path, then line. Same path+line: preserve original order
    return compareReferences(refA, refB);
  });
}

function compareReferences(
  refA: NonNullable<Entry['references']>[number],
  refB: NonNullable<Entry['references']>[number]
): number {
  const pathCompare = localeCompare(refA.path, refB.path);
  if (pathCompare !== 0) return pathCompare;
  return (refA.line ?? 0) - (refB.line ?? 0);
}

function localeCompare(a: string, b: string) {
  return a.localeCompare(b, 'en');
}
