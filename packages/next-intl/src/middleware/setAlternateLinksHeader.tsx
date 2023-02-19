import {NextRequest, NextResponse} from 'next/server';
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

/**
 * See https://developers.google.com/search/docs/specialty/international/localized-versions
 */
export default function setAlternateLinksHeader(
  config: NextIntlMiddlewareConfig,
  request: NextRequest,
  response: NextResponse
) {
  // Avoid pointing to a localized subpath that is not relevant
  if (config.locales.length <= 1) {
    return;
  }

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

    if (domainConfigs.length > 1) {
      // Prio 1: Configured domain(s)
      return domainConfigs.map((domainConfig) => {
        url = new URL(unprefixedPathname);
        url.host = domainConfig.domain;
        return `<${url}>; rel="alternate"; hreflang="${locale}"`;
      });
    } else {
      // Prio 2: Prefixed route
      url = new URL(unprefixedPathname);
      localizePathname(url);
    }

    return `<${url}>; rel="alternate"; hreflang="${locale}"`;
  });

  links.push(
    `<${getUnprefixedPathname(
      config,
      request
    )}>; rel="alternate"; hreflang="x-default"`
  );

  response.headers.set('Link', links.join(', '));
}
