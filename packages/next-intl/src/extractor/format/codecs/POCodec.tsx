import POParser from 'po-parser';
import {setNestedProperty} from '../../utils.js';
import {defineCodec} from '../ExtractorCodec.js';
import {getSortedMessages} from '../utils.js';

export default defineCodec(() => {
  // See also https://www.gnu.org/software/gettext/manual/html_node/Header-Entry.html
  const DEFAULT_METADATA = {
    // Recommended by spec
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Transfer-Encoding': '8bit',

    // Otherwise other tools might set this
    'X-Generator': 'next-intl',

    // Crowdin defaults to using msgid as source key
    'X-Crowdin-SourceKey': 'msgstr'
  };

  // Move all parts before the last dot to msgctxt
  const NAMESPACE_SEPARATOR = '.';

  // Metadata is stored so it can be retained when writing
  const metadataByLocale = new Map();

  return {
    decode(content, context) {
      const catalog = POParser.parse(content);
      if (catalog.meta) {
        metadataByLocale.set(context.locale, catalog.meta);
      }
      const messages = catalog.messages || [];
      return messages.map((msg) => {
        const {msgctxt, msgid, msgstr, ...rest} = msg;

        return {
          ...rest,
          id: msgctxt ? [msgctxt, msgid].join(NAMESPACE_SEPARATOR) : msgid,
          message: msgstr
        };
      });
    },

    encode(messages, context) {
      const encodedMessages = getSortedMessages(messages).map((msg) => {
        const {id, message, ...rest} = msg;

        if (id.includes(NAMESPACE_SEPARATOR)) {
          const lastDotIndex = id.lastIndexOf(NAMESPACE_SEPARATOR);
          return {
            ...rest,
            msgctxt: id.slice(0, lastDotIndex),
            msgid: id.slice(lastDotIndex + NAMESPACE_SEPARATOR.length),
            msgstr: message
          };
        }

        return {
          ...rest,
          msgid: id,
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
