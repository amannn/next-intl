const LAZY_ONLY_ENV_KEY = '_NEXT_INTL_TREE_SHAKING_LAZY_ONLY';
const IGNORE_INJECTED_MANIFEST_ENV_KEY =
  '_NEXT_INTL_TREE_SHAKING_IGNORE_INJECTED_MANIFEST';

function isTruthy(value: string | undefined): boolean {
  return value === '1' || value === 'true';
}

export function isTreeShakingLazyOnly(): boolean {
  return isTruthy(process.env[LAZY_ONLY_ENV_KEY]);
}

export function getTreeShakingLazyOnlyEnvKey(): string {
  return LAZY_ONLY_ENV_KEY;
}

export function shouldIgnoreInjectedTreeShakingManifest(): boolean {
  return isTruthy(process.env[IGNORE_INJECTED_MANIFEST_ENV_KEY]);
}

export function getIgnoreInjectedManifestEnvKey(): string {
  return IGNORE_INJECTED_MANIFEST_ENV_KEY;
}
