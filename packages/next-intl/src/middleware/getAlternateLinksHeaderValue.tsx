import {NextRequest} from 'next/server';
import NextIntlMiddlewareConfig, {
  NextIntlMiddlewareConfigWithDefaults
} from './NextIntlMiddlewareConfig';

function getUnprefixedUrl(
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
  config: NextIntlMiddlewareConfigWithDefaults,
  request: NextRequest
) {
  const unprefixedUrl = getUnprefixedUrl(config, request);

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

    if (config.routing.type === 'domain') {
      const domainConfigs =
        config.routing.domains.filter((cur) => cur.locale === locale) || [];

      return domainConfigs.map((domainConfig) => {
        url = new URL(unprefixedUrl);
        url.port = '';
        url.host = domainConfig.domain;
        return getAlternateEntry(url.toString(), locale);
      });
    } else {
      url = new URL(unprefixedUrl);
      if (
        locale !== config.defaultLocale ||
        config.routing.prefix === 'always'
      ) {
        localizePathname(url);
      }
    }

    return getAlternateEntry(url.toString(), locale);
  });

  // Add x-default entry
  if (config.routing.type === 'prefix') {
    const url = new URL(unprefixedUrl);
    links.push(getAlternateEntry(url.toString(), 'x-default'));
  } else {
    // For `type: domain` there is no reasonable x-default
  }

  return links.join(', ');
}
