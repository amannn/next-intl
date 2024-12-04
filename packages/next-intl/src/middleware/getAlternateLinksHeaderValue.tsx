import type {NextRequest} from 'next/server.js';
import type {ResolvedRoutingConfig} from '../routing/config.tsx';
import type {
  DomainsConfig,
  LocalePrefixMode,
  Locales,
  Pathnames
} from '../routing/types.tsx';
import {normalizeTrailingSlash} from '../shared/utils.tsx';
import {
  applyBasePath,
  formatTemplatePathname,
  getHost,
  getLocalePrefixes,
  getNormalizedPathname,
  isLocaleSupportedOnDomain
} from './utils.tsx';

/**
 * See https://developers.google.com/search/docs/specialty/international/localized-versions
 */
export default function getAlternateLinksHeaderValue<
  AppLocales extends Locales,
  AppLocalePrefixMode extends LocalePrefixMode,
  AppPathnames extends Pathnames<AppLocales> | undefined,
  AppDomains extends DomainsConfig<AppLocales> | undefined
>({
  localizedPathnames,
  request,
  resolvedLocale,
  routing
}: {
  routing: Omit<
    ResolvedRoutingConfig<
      AppLocales,
      AppLocalePrefixMode,
      AppPathnames,
      AppDomains
    >,
    'pathnames'
  >;
  request: NextRequest;
  resolvedLocale: AppLocales[number];
  localizedPathnames?: Pathnames<AppLocales>[string];
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
    routing.locales,
    routing.localePrefix
  );

  function getAlternateEntry(url: URL, locale: AppLocales[number]) {
    url.pathname = normalizeTrailingSlash(url.pathname);

    if (request.nextUrl.basePath) {
      url = new URL(url);
      url.pathname = applyBasePath(url.pathname, request.nextUrl.basePath);
    }

    return `<${url.toString()}>; rel="alternate"; hreflang="${locale}"`;
  }

  function getLocalizedPathname(pathname: string, locale: AppLocales[number]) {
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

  const links = getLocalePrefixes(
    routing.locales as AppLocales,
    routing.localePrefix,
    false
  ).flatMap(([locale, prefix]) => {
    function prefixPathname(pathname: string) {
      if (pathname === '/') {
        return prefix;
      } else {
        return prefix + pathname;
      }
    }

    let url: URL;

    if (routing.domains) {
      const domainConfigs = routing.domains.filter((cur) =>
        isLocaleSupportedOnDomain(locale, cur)
      );

      return domainConfigs.map((domainConfig) => {
        url = new URL(normalizedUrl);
        url.port = '';
        url.host = domainConfig.domain;

        // Important: Use `normalizedUrl` here, as `url` potentially uses
        // a `basePath` that automatically gets applied to the pathname
        url.pathname = getLocalizedPathname(normalizedUrl.pathname, locale);

        if (
          locale !== domainConfig.defaultLocale ||
          routing.localePrefix.mode === 'always'
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

      if (
        locale !== routing.defaultLocale ||
        routing.localePrefix.mode === 'always'
      ) {
        pathname = prefixPathname(pathname);
      }
      url = new URL(pathname, normalizedUrl);
    }

    return getAlternateEntry(url, locale);
  });

  // Add x-default entry
  const shouldAddXDefault =
    // For domain-based routing there is no reasonable x-default
    !routing.domains &&
    (routing.localePrefix.mode !== 'always' || normalizedUrl.pathname === '/');
  if (shouldAddXDefault) {
    const url = new URL(
      getLocalizedPathname(normalizedUrl.pathname, routing.defaultLocale),
      normalizedUrl
    );
    links.push(getAlternateEntry(url, 'x-default'));
  }

  return links.join(', ');
}
