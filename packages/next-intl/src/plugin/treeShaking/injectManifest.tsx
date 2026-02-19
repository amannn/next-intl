import type {ManifestNamespaces} from '../../tree-shaking/Manifest.js';

export const PROVIDER_NAME = 'NextIntlClientProvider';
export const INFERRED_MANIFEST_PROP = '__inferredManifest';

export function injectManifestProp(
  source: string,
  manifest: ManifestNamespaces
): string {
  const manifestJson = JSON.stringify(manifest);
  const propInjection = ` ${INFERRED_MANIFEST_PROP}={${manifestJson}}`;

  const re = new RegExp(`(<${PROVIDER_NAME}(?:\\s[^>]*?)?)(\\s*>)`, 's');
  const match = source.match(re);
  if (!match) return source;

  const before = match[1];
  if (before.includes(INFERRED_MANIFEST_PROP)) return source;

  return source.replace(re, `$1${propInjection}$2`);
}
