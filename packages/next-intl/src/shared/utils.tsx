import {Locales, LocalePrefixConfigVerbose} from '../routing/types';

export function prefixPathname(prefix: string, pathname: string) {
  let localizedHref = prefix;

  // Avoid trailing slashes
  if (/^\/(\?.*)?$/.test(pathname)) {
    pathname = pathname.slice(1);
  }

  localizedHref += pathname;

  return localizedHref;
}

export function matchesPathname(
  /** E.g. `/users/[userId]-[userName]` */
  template: string,
  /** E.g. `/users/23-jane` */
  pathname: string
) {
  const regex = templateToRegex(template);
  return regex.test(pathname);
}

export function getLocalePrefix<AppLocales extends Locales>(
  locale: AppLocales[number],
  localePrefix: LocalePrefixConfigVerbose<AppLocales>
) {
  return (
    (localePrefix.mode !== 'never' && localePrefix.prefixes?.[locale]) ||
    // We return a prefix even if `mode: 'never'`. It's up to the consumer
    // to decide to use it or not.
    '/' + locale
  );
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
