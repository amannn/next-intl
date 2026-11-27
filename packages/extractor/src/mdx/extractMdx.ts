import type {RawSourceMap} from 'source-map';
import type {SourceExtractedMessage} from '../types.js';
import recmaExtracted from './recmaExtracted.js';

export default async function extractMdx(
  filePath: string,
  source: string,
  extract: (code: string) => Promise<Array<SourceExtractedMessage>>
): Promise<Array<SourceExtractedMessage>> {
  const [{compile}, {SourceMapGenerator, SourceMapConsumer}] =
    await Promise.all([import('@mdx-js/mdx'), import('source-map')]);
  const compiled = await compile(
    {path: filePath, value: source},
    {recmaPlugins: [recmaExtracted], SourceMapGenerator}
  );
  const messages = await extract(String(compiled));
  if (messages.length === 0) return messages;

  // SWC's plugin reports positions in the compiled JavaScript, even when an
  // input source map is provided. Resolve them back to the author's MDX.
  return SourceMapConsumer.with(compiled.map as RawSourceMap, null, (map) =>
    messages.map((message) => {
      const position = map.originalPositionFor({
        line: message.reference.line!,
        column: message.reference.column!
      });
      return {
        ...message,
        reference: {
          path: message.reference.path,
          ...(position.line != null && position.column != null
            ? {line: position.line, column: position.column}
            : {})
        }
      };
    })
  );
}
