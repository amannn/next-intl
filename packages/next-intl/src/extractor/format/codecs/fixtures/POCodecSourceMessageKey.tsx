import POParser from 'po-parser';
import {getSortedMessages, setNestedProperty} from '../../../utils.js';
import {defineCodec} from '../../ExtractorCodec.js';

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
        const {
          extractedComments,
          msgctxt,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          msgid,
          msgstr,
          references,
          ...rest
        } = msg;

        // Necessary to restore the ID
        if (!msgctxt) {
          throw new Error('msgctxt is required');
        }

        return {
          ...rest,
          id: msgctxt,
          message: msgstr,
          description: extractedComments ?? [],
          references: references ?? []
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
        const {description = [], id, message, references, ...rest} = msg;

        // Path-only refs (no `:line`), unique paths
        const pathOnlyRefs: Array<{path: string}> = [];
        if (references.length > 0) {
          const seenPaths = new Set<string>();
          for (const reference of references) {
            if (seenPaths.has(reference.path)) continue;
            seenPaths.add(reference.path);
            pathOnlyRefs.push({path: reference.path});
          }
        }

        return {
          ...(description.length > 0 && {extractedComments: description}),
          ...(pathOnlyRefs.length > 0 && {references: pathOnlyRefs}),
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
