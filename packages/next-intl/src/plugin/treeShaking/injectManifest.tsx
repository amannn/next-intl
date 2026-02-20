import MagicString from 'magic-string';
import type {ManifestNamespaces} from '../../tree-shaking/Manifest.js';

export const PROVIDER_NAME = 'NextIntlClientProvider';
export const INFERRED_MANIFEST_PROP = '__inferredManifest';

export type InjectManifestResult = {
  code: string;
  map: ReturnType<MagicString['generateMap']> | undefined;
};

export function injectManifestProp(
  source: string,
  manifest: ManifestNamespaces,
  filename?: string
): InjectManifestResult {
  const manifestJson = JSON.stringify(manifest);
  const propInjection = ` ${INFERRED_MANIFEST_PROP}={${manifestJson}}`;

  const re = new RegExp(`(<${PROVIDER_NAME}(?:\\s[^>]*?)?)(\\s*>)`, 's');
  const match = source.match(re);
  if (!match) {
    return {code: source, map: undefined};
  }

  const before = match[1];
  if (before.includes(INFERRED_MANIFEST_PROP)) {
    return {code: source, map: undefined};
  }

  const s = new MagicString(source);
  const start = match.index!;
  const end = start + match[0].length;
  s.overwrite(start, end, match[1] + propInjection + match[2]);

  const map = s.generateMap({
    source: filename,
    includeContent: true
  });

  return {code: s.toString(), map};
}
