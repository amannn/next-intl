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

  // Metadata is stored so it can be retained when writing
  const metadataByLocale = new Map();

  return {
    decode(content, context) {
      const catalog = POParser.parse(content);
      if (catalog.meta) {
        metadataByLocale.set(context.locale, catalog.meta);
      }
      return catalog.messages || [];
    },

    encode(messages, context) {
      return POParser.serialize({
        meta: {
          Language: context.locale,
          ...DEFAULT_METADATA,
          ...metadataByLocale.get(context.locale)
        },
        messages: getSortedMessages(messages)
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
