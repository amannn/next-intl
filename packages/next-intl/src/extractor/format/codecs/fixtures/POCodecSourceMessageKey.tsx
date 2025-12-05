import crypto from 'crypto';
import POParser from 'po-parser';
import {setNestedProperty} from '../../../utils.js';
import {defineCodec} from '../../ExtractorCodec.js';
import {getSortedMessages} from '../../utils.js';

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

      // Note: The ids could also be persisted separately in the encode function
      // (either as part of the .po file or separately) to avoid recomputing them.
      return messages.map((msg) => ({
        ...msg,
        id: getId(msg.id),
        message: msg.message
      }));
    },

    encode(messages, context) {
      const encodedMessages = messages.map((msg) => {
        const sourceMessage = context.sourceMessagesById.get(msg.id)?.message;
        if (!sourceMessage) {
          throw new Error(
            `Source message not found for id "${msg.id}" in locale "${context.locale}".`
          );
        }

        return {
          ...msg,
          id: sourceMessage,
          message: msg.message
        };
      });

      return POParser.serialize({
        meta: {
          Language: context.locale,
          ...DEFAULT_METADATA,
          ...metadataByLocale.get(context.locale)
        },
        messages: getSortedMessages(encodedMessages)
      });
    },

    toJSONString(source, context) {
      const parsed = this.decode(source, context);
      const messagesObject = {};
      for (const message of parsed) {
        setNestedProperty(messagesObject, message.id, message.message);
      }
      return JSON.stringify(messagesObject, null, 2);
    }
  };
});

function getId(message: string): string {
  const hash = crypto.createHash('sha512').update(message).digest();
  const base64 = hash.toString('base64');
  return base64.slice(0, 6);
}
