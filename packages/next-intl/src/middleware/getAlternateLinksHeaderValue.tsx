import {NextRequest} from 'next/server';
import {AllLocales, Pathnames} from '../shared/types';
import {MiddlewareConfigWithDefaults} from './NextIntlMiddlewareConfig';
import {
  applyBasePath,
  formatTemplatePathname,
  getHost,
  getNormalizedPathname,
  isLocaleSupportedOnDomain
} from './utils';

/**
 * See https://developers.google.com/search/docs/specialty/international/localized-versions
 */
export default function getAlternateLinksHeaderValue<
  Locales extends AllLocales
>({
  config,
  localizedPathnames,
  request,
  resolvedLocale
}: {
  config: MiddlewareConfigWithDefaults<Locales>;
  request: NextRequest;
  resolvedLocale: Locales[number];
  localizedPathnames?: Pathnames<Locales>[string];
}) {
  const normalizedUrl = request.nextUrl.clone();

  const host = getHost(request.headers);
  if (host) {
    normalizedUrl.port = '';
    normalizedUrl.host = host;
  }
  normalizedUrl.protocol =
    request.headers.get('x-forwarded-proto') ?? normalizedUrl.protocol;

  normalizedUrl.pathname = getNormalizedPathname(
    normalizedUrl.pathname,
    config.locales
  );

  function getAlternateEntry(url: URL, locale: string) {
    if (request.nextUrl.basePath) {
      url = new URL(url);
      url.pathname = applyBasePath(url.pathname, request.nextUrl.basePath);
    }

    return `<${url.toString()}>; rel="alternate"; hreflang="${locale}"`;
  }

  function getLocalizedPathname(pathname: string, locale: Locales[number]) {
    if (localizedPathnames && typeof localizedPathnames === 'object') {
      return formatTemplatePathname(
        pathname,
        localizedPathnames[resolvedLocale],
        localizedPathnames[locale]
      );
    } else {
      return pathname;
    }
  }

  const links = config.locales.flatMap((locale) => {
    function prefixPathname(pathname: string) {
      if (pathname === '/') {
        return `/${locale}`;
      } else {
        return `/${locale}${pathname}`;
      }
    }

    let url: URL;

    if (config.domains) {
      const domainConfigs =
        config.domains.filter((cur) =>
          isLocaleSupportedOnDomain(locale, cur)
        ) || [];

      return domainConfigs.map((domainConfig) => {
        url = new URL(normalizedUrl);
        url.port = '';
        url.host = domainConfig.domain;

        // Important: Use `normalizedUrl` here, as `url` potentially uses
        // a `basePath` that automatically gets applied to the pathname
        url.pathname = getLocalizedPathname(normalizedUrl.pathname, locale);

        if (
          locale !== domainConfig.defaultLocale ||
          config.localePrefix === 'always'
        ) {
          url.pathname = prefixPathname(url.pathname);
        }

        return getAlternateEntry(url, locale);
      });
    } else {
      let pathname: string;
      if (localizedPathnames && typeof localizedPathnames === 'object') {
        pathname = getLocalizedPathname(normalizedUrl.pathname, locale);
      } else {
        pathname = normalizedUrl.pathname;
      }

      if (locale !== config.defaultLocale || config.localePrefix === 'always') {
        pathname = prefixPathname(pathname);
      }
      url = new URL(pathname, normalizedUrl);
    }

    return getAlternateEntry(url, locale);
  });

  // Add x-default entry
  const shouldAddXDefault =
    // For domain-based routing there is no reasonable x-default
    !config.domains &&
    (config.localePrefix !== 'always' || normalizedUrl.pathname === '/');
  if (shouldAddXDefault) {
    const url = new URL(
      getLocalizedPathname(normalizedUrl.pathname, config.defaultLocale),
      normalizedUrl
    );
    links.push(getAlternateEntry(url, 'x-default'));
  }

  return links.join(', ');
}
