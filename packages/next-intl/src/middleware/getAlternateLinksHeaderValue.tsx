import {NextRequest} from 'next/server';
import NextIntlMiddlewareConfig from './NextIntlMiddlewareConfig';

function getUnprefixedPathname(
  config: NextIntlMiddlewareConfig,
  request: NextRequest
) {
  const url = new URL(request.url);
  if (!url.pathname.endsWith('/')) {
    url.pathname += '/';
  }

  url.pathname = url.pathname.replace(
    new RegExp(`^/(${config.locales.join('|')})/`),
    '/'
  );

  // Remove trailing slash
  if (url.pathname !== '/') {
    url.pathname = url.pathname.slice(0, -1);
  }

  return url.toString();
}

function getAlternateEntry(url: string, locale: string) {
  return `<${url}>; rel="alternate"; hreflang="${locale}"`;
}

/**
 * See https://developers.google.com/search/docs/specialty/international/localized-versions
 */
export default function getAlternateLinksHeaderValue(
  config: NextIntlMiddlewareConfig,
  request: NextRequest
) {
  const unprefixedPathname = getUnprefixedPathname(config, request);

  const links = config.locales.flatMap((locale) => {
    function localizePathname(url: URL) {
      if (url.pathname === '/') {
        url.pathname = `/${locale}`;
      } else {
        url.pathname = `/${locale}${url.pathname}`;
      }
      return url;
    }

    let url;

    const domainConfigs =
      config.domains?.filter((cur) => cur.defaultLocale === locale) || [];

    if (domainConfigs.length > 0) {
      // Prio 1: Configured domain(s)
      return domainConfigs.map((domainConfig) => {
        url = new URL(unprefixedPathname);
        url.host = domainConfig.domain;
        return getAlternateEntry(url.toString(), locale);
      });
    } else {
      // Prio 2: Prefixed route
      url = new URL(unprefixedPathname);
      localizePathname(url);
    }

    return getAlternateEntry(url.toString(), locale);
  });

  // Add x-default entry
  const defaultLocaleDomainConfig = config.domains?.find(
    (cur) => cur.defaultLocale === config.defaultLocale
  );
  let defaultPathname = unprefixedPathname;
  if (defaultLocaleDomainConfig) {
    const url = new URL(unprefixedPathname);
    url.host = defaultLocaleDomainConfig.domain;
    defaultPathname = url.toString();
  }
  links.push(getAlternateEntry(defaultPathname, 'x-default'));

  return links.join(', ');
}
