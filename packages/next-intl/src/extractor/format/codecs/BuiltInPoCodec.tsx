import createPoCodec from '@eloqnt/format-po';
import {defineCodec} from '../ExtractorCodec.js';

// `@eloqnt/format-po`, guarded so catalogs in the previous key-based layout
// fail loudly. Custom codecs referencing the package directly opt out.
export default defineCodec(() => {
  const codec = createPoCodec();

  function assertMigrated(content: string) {
    if (content.includes('X-Crowdin-SourceKey: msgstr')) {
      throw new Error(
        'This catalog uses the previous PO layout of next-intl, which stored message keys in `msgid`. The PO format now follows the gettext convention: the source text in `msgid` and the message key in `msgctxt`. Please migrate your catalogs, or use a custom codec to keep the previous layout: https://github.com/amannn/next-intl/pull/2393'
      );
    }
  }

  return {
    ...codec,
    decode(content, context) {
      assertMigrated(content);
      return codec.decode(content, context);
    }
  };
});
