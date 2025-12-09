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
          msgctxt,
          msgid, // eslint-disable-line @typescript-eslint/no-unused-vars -- not used
          msgstr,
          ...rest
        } = msg;

        // Necessary to restore the ID
        if (!msgctxt) {
          throw new Error('msgctxt is required');
        }

        return {
          ...rest,
          id: msgctxt,
          message: msgstr
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
        const {id, message, ...rest} = msg;
        return {
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
