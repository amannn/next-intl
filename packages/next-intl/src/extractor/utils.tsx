import type {ExtractorConfig} from '@eloqnt/extractor/_internal';

export function hasLocalesToExtract(
  config: Pick<ExtractorConfig, 'extract'>
): boolean {
  const {locales} = config.extract;
  return locales === 'infer' || locales.length > 0;
}

export function getDefaultProjectRoot() {
  return process.cwd();
}
