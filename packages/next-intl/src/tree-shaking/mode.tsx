const LAZY_ONLY_ENV_KEY = '_NEXT_INTL_TREE_SHAKING_LAZY_ONLY';

function isTruthy(value: string | undefined): boolean {
  return value === '1' || value === 'true';
}

export function isTreeShakingLazyOnly(): boolean {
  return isTruthy(process.env[LAZY_ONLY_ENV_KEY]);
}

export function getTreeShakingLazyOnlyEnvKey(): string {
  return LAZY_ONLY_ENV_KEY;
}
