import type {LinkProps} from 'next/link.js';
import type {
  LocalePrefixConfigVerbose,
  LocalePrefixMode,
  Locales
} from '../routing/types.js';

type Href = LinkProps['href'];

function isRelativeHref(href: Href) {
  const pathname = typeof href === 'object' ? href.pathname : href;
  return pathname != null && !pathname.startsWith('/');
}

function isLocalHref(href: Href) {
  if (typeof href === 'object') {
    return href.host == null && href.hostname == null;
  } else {
    const hasProtocol = /^[a-z]+:/i.test(href);
    return !hasProtocol;
  }
}

export function isLocalizableHref(href: Href) {
  return isLocalHref(href) && !isRelativeHref(href);
}

export function unprefixPathname(pathname: string, prefix: string) {
  return pathname.replace(new RegExp(`^${prefix}`), '') || '/';
}

export function prefixPathname(prefix: string, pathname: string) {
  let localizedHref = prefix;

  // Avoid trailing slashes
  if (/^\/(\?.*)?$/.test(pathname)) {
    pathname = pathname.slice(1);
  }

  localizedHref += pathname;

  return localizedHref;
}

export function hasPathnamePrefixed(
  prefix: string | undefined,
  pathname: string
) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function hasTrailingSlash() {
  try {
    // Provided via `env` setting in `next.config.js` via the plugin
    return process.env._next_intl_trailing_slash === 'true';
  } catch {
    return false;
  }
}

export function normalizeTrailingSlash(pathname: string) {
  const trailingSlash = hasTrailingSlash();

  if (pathname !== '/') {
    const pathnameEndsWithSlash = pathname.endsWith('/');
    if (trailingSlash && !pathnameEndsWithSlash) {
      pathname += '/';
    } else if (!trailingSlash && pathnameEndsWithSlash) {
      pathname = pathname.slice(0, -1);
    }
  }

  return pathname;
}

export function matchesPathname(
  /** E.g. `/users/[userId]-[userName]` */
  template: string,
  /** E.g. `/users/23-jane` */
  pathname: string
) {
  const normalizedTemplate = normalizeTrailingSlash(template);
  const normalizedPathname = normalizeTrailingSlash(pathname);

  const regex = templateToRegex(normalizedTemplate);
  return regex.test(normalizedPathname);
}

export function getLocalePrefix<
  AppLocales extends Locales,
  AppLocalePrefixMode extends LocalePrefixMode
>(
  locale: AppLocales[number],
  localePrefix: LocalePrefixConfigVerbose<AppLocales, AppLocalePrefixMode>
) {
  return (
    (localePrefix.mode !== 'never' && localePrefix.prefixes?.[locale]) ||
    // We return a prefix even if `mode: 'never'`. It's up to the consumer
    // to decide to use it or not.
    getLocaleAsPrefix(locale)
  );
}

export function getLocaleAsPrefix(locale: string) {
  return '/' + locale;
}

export function templateToRegex(template: string): RegExp {
  const regexPattern = template
    // Replace optional catchall ('[[...slug]]')
    .replace(/\[\[(\.\.\.[^\]]+)\]\]/g, '?(.*)')
    // Replace catchall ('[...slug]')
    .replace(/\[(\.\.\.[^\]]+)\]/g, '(.+)')
    // Replace regular parameter ('[slug]')
    .replace(/\[([^\]]+)\]/g, '([^/]+)');

  return new RegExp(`^${regexPattern}$`);
}

function isOptionalCatchAllSegment(pathname: string) {
  return pathname.includes('[[...');
}

function isCatchAllSegment(pathname: string) {
  return pathname.includes('[...');
}

function isDynamicSegment(pathname: string) {
  return pathname.includes('[');
}

function comparePathnamePairs(a: string, b: string): number {
  const pathA = a.split('/');
  const pathB = b.split('/');

  const maxLength = Math.max(pathA.length, pathB.length);
  for (let i = 0; i < maxLength; i++) {
    const segmentA = pathA[i];
    const segmentB = pathB[i];

    // If one of the paths ends, prioritize the shorter path
    if (!segmentA && segmentB) return -1;
    if (segmentA && !segmentB) return 1;

    if (!segmentA && !segmentB) continue;

    // Prioritize static segments over dynamic segments
    if (!isDynamicSegment(segmentA) && isDynamicSegment(segmentB)) return -1;
    if (isDynamicSegment(segmentA) && !isDynamicSegment(segmentB)) return 1;

    // Prioritize non-catch-all segments over catch-all segments
    if (!isCatchAllSegment(segmentA) && isCatchAllSegment(segmentB)) return -1;
    if (isCatchAllSegment(segmentA) && !isCatchAllSegment(segmentB)) return 1;

    // Prioritize non-optional catch-all segments over optional catch-all segments
    if (
      !isOptionalCatchAllSegment(segmentA) &&
      isOptionalCatchAllSegment(segmentB)
    ) {
      return -1;
    }
    if (
      isOptionalCatchAllSegment(segmentA) &&
      !isOptionalCatchAllSegment(segmentB)
    ) {
      return 1;
    }

    if (segmentA === segmentB) continue;
  }

  // Both pathnames are completely static
  return 0;
}

export function getSortedPathnames(pathnames: Array<string>) {
  return pathnames.sort(comparePathnamePairs);
}
