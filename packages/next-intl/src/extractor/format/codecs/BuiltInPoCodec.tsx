import createPoCodec from '@eloqnt/format-po';
import {defineCodec} from '../ExtractorCodec.js';

// `@eloqnt/format-po`, guarded so catalogs in the previous key-based layout
// or without a layout header fail loudly instead of being silently mis-keyed.
// Custom codecs referencing the package directly opt out.
export default defineCodec(() => {
  const codec = createPoCodec();

  function assertLayout(content: string) {
    if (content.includes('X-Crowdin-SourceKey: msgstr')) {
      throw new Error(
        'This catalog uses the previous PO layout of next-intl, which stored message keys in `msgid`. The PO format now follows the gettext convention: the source text in `msgid` and the message key in `msgctxt`. Please migrate your catalogs, or use a custom codec to keep the previous layout: https://github.com/amannn/next-intl/pull/2393'
      );
    }
    // An entry with a non-empty msgid, while the header that marks where
    // message keys live is absent.
    if (
      !content.includes('X-Message-Key: msgctxt') &&
      /^msgid "./m.test(content)
    ) {
      throw new Error(
        'This catalog carries no layout header. Add `"X-Message-Key: msgctxt\\n"` to its header block if the file stores message keys in `msgctxt`, or see the migration notes: https://github.com/amannn/next-intl/pull/2393'
      );
    }
  }

  return {
    ...codec,
    decode(content, context) {
      assertLayout(content);
      return codec.decode(content, context);
    }
  };
});
