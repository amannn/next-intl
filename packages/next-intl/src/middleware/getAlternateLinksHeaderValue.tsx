import {NextRequest} from 'next/server';
import MiddlewareConfig, {
  MiddlewareConfigWithDefaults
} from './NextIntlMiddlewareConfig';
import {isLocaleSupportedOnDomain} from './utils';

function getUnprefixedUrl(config: MiddlewareConfig, request: NextRequest) {
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
  config: MiddlewareConfigWithDefaults,
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

    if (config.domains) {
      const domainConfigs =
        config.domains.filter((cur) =>
          isLocaleSupportedOnDomain(locale, cur)
        ) || [];

      return domainConfigs.map((domainConfig) => {
        url = new URL(unprefixedUrl);
        url.port = '';
        url.host = domainConfig.domain;

        if (
          locale !== domainConfig.defaultLocale ||
          config.localePrefix === 'always'
        ) {
          localizePathname(url);
        }

        return getAlternateEntry(url.toString(), locale);
      });
    } else {
      url = new URL(unprefixedUrl);
      if (locale !== config.defaultLocale || config.localePrefix === 'always') {
        localizePathname(url);
      }
    }

    return getAlternateEntry(url.toString(), locale);
  });

  // Add x-default entry
  if (!config.domains) {
    const url = new URL(unprefixedUrl);
    links.push(getAlternateEntry(url.toString(), 'x-default'));
  } else {
    // For `type: domain` there is no reasonable x-default
  }

  return links.join(', ');
}
