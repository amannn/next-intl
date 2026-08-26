import {defineCodec} from '@eloqnt/config';
import createPoCodec from '@eloqnt/format-po';
import POParser from 'po-parser';

// Writes the PO layout of earlier next-intl versions (message key in
// `msgid`, `X-Crowdin-SourceKey` header). Reading is delegated to
// `@eloqnt/format-po`, which handles that layout natively. Namespaced keys
// stay whole in `msgid` instead of being split into `msgctxt` — both
// spellings decode identically.
export default defineCodec(() => {
  const codec = createPoCodec();

  return {
    ...codec,
    encode(messages, context) {
      const output = codec.encode(messages, context);
      // Files read in the previous layout are already written back in it.
      if (!output.includes('X-Message-Key: msgctxt')) return output;

      const catalog = POParser.parse(output);
      const meta: Record<string, string> = {
        ...catalog.meta,
        'X-Crowdin-SourceKey': 'msgstr'
      };
      delete meta['X-Message-Key'];
      for (const entry of catalog.messages ?? []) {
        if (entry.msgctxt !== undefined) {
          entry.msgid = entry.msgctxt;
          delete entry.msgctxt;
        }
      }
      return POParser.serialize({...catalog, meta});
    }
  };
});
