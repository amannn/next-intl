import createPoCodec from '@eloqnt/format-po';
import POParser from 'po-parser';
import {defineCodec} from '../../ExtractorCodec.js';

/**
 * Writes the PO layout of earlier next-intl versions: the message key in
 * `msgid`, the text in `msgstr`, and the `X-Crowdin-SourceKey` header that
 * tells Crowdin where the source text lives. Reading is delegated to
 * `@eloqnt/format-po`, which understands this layout natively. One deliberate
 * difference to the old built-in codec: namespaced keys stay whole in `msgid`
 * instead of being split into `msgctxt` — both spellings decode identically.
 *
 * Referenced from the docs as the opt-out for projects that want to keep the
 * previous layout.
 */
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
