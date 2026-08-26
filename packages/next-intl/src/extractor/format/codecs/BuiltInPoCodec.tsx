import createPoCodec from '@eloqnt/format-po';
import {defineCodec} from '../ExtractorCodec.js';

const LEGACY_HEADER = 'X-Crowdin-SourceKey: msgstr';

const MIGRATION_ERROR = `This catalog uses the previous PO layout of next-intl, which stored message keys in \`msgid\`. The PO format now follows the gettext convention: the source text in \`msgid\` and the message key in \`msgctxt\`. Please migrate your catalogs, or use a custom codec to keep the previous layout: https://next-intl.dev/docs/usage/plugin#formats-po-migration`;

/**
 * The built-in PO format: `@eloqnt/format-po`, guarded so catalogs in the
 * previous key-based layout fail loudly with migration instructions instead
 * of being silently carried along. The underlying codec reads the previous
 * layout fine — a custom codec referencing `@eloqnt/format-po` directly opts
 * out of this guard.
 */
export default defineCodec(() => {
  const codec = createPoCodec();

  function assertMigrated(content: string) {
    if (content.includes(LEGACY_HEADER)) {
      throw new Error(MIGRATION_ERROR);
    }
  }

  return {
    ...codec,
    decode(content, context) {
      assertMigrated(content);
      return codec.decode(content, context);
    },
    toJSONString(content, context) {
      assertMigrated(content);
      return codec.toJSONString(content, context);
    }
  };
});
