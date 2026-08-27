import createJsonCodec from '@eloqnt/format-json';
import {defineCodec} from '../ExtractorCodec.js';

// `@eloqnt/format-json`, with a blank file reading as an empty catalog (e.g.
// a file created to receive a new locale).
export default defineCodec(() => {
  const codec = createJsonCodec();

  return {
    ...codec,
    decode(content, context) {
      if (content.trim() === '') return [];
      return codec.decode(content, context);
    }
  };
});
