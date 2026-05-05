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
        const {extractedComments, msgctxt, msgid, msgstr, ...rest} = msg;

        // Necessary to restore the ID
        if (!msgctxt) {
          throw new Error(`msgctxt is required for msgid "${msgid}"`);
        }

        return {
          ...rest,
          id: msgctxt,
          message: msgstr,
          ...(extractedComments &&
            extractedComments.length > 0 && {
              description:
                extractedComments.length === 1
                  ? extractedComments[0]
                  : extractedComments
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
          ...(description && {
            extractedComments: Array.isArray(description)
              ? description
              : [description]
          }),
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
