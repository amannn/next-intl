import type {NextRequest} from 'next/server.js';
import type {ResolvedRoutingConfig} from '../routing/config.js';
import type {
  DomainsConfig,
  LocalePrefixMode,
  Locales,
  Pathnames
} from '../routing/types.js';
import {normalizeTrailingSlash} from '../shared/utils.js';
import {
  applyBasePath,
  formatTemplatePathname,
  getHost,
  getLocalePrefixes,
  getNormalizedPathname,
  isLocaleSupportedOnDomain
} from './utils.js';

/**
 * See https://developers.google.com/search/docs/specialty/international/localized-versions
 */
export default function getAlternateLinksHeaderValue<
  AppLocales extends Locales,
  AppLocalePrefixMode extends LocalePrefixMode,
  AppPathnames extends Pathnames<AppLocales> | undefined,
  AppDomains extends DomainsConfig<AppLocales> | undefined
>({
  internalTemplateName,
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
  internalTemplateName?: string;
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
      if (localizedPathnames[locale] === null) return;
      const sourceTemplate = localizedPathnames[resolvedLocale];

      return formatTemplatePathname(
        pathname,
        sourceTemplate ?? internalTemplateName ?? pathname,
        localizedPathnames[locale] ?? internalTemplateName ?? pathname
      );
    } else {
      return pathname;
    }
  }

  const links = getLocalePrefixes(
    routing.locales as AppLocales,
    routing.localePrefix,
    false
  )
    .flatMap(([locale, prefix]) => {
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
          const pathname = getLocalizedPathname(normalizedUrl.pathname, locale);
          if (!pathname) return undefined;

          url = new URL(normalizedUrl);
          url.port = '';
          url.host = domainConfig.domain;

          // Important: Use `normalizedUrl` here, as `url` potentially uses
          // a `basePath` that automatically gets applied to the pathname
          url.pathname = pathname;

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
          const candidate = getLocalizedPathname(
            normalizedUrl.pathname,
            locale
          );
          if (!candidate) return undefined;
          pathname = candidate;
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
    })
    .filter((link) => link != null);

  // Add x-default entry
  const shouldAddXDefault =
    // For domain-based routing there is no reasonable x-default
    !routing.domains || routing.domains.length === 0;
  if (shouldAddXDefault) {
    const localizedPathname = getLocalizedPathname(
      normalizedUrl.pathname,
      routing.defaultLocale
    );
    if (localizedPathname) {
      const url = new URL(localizedPathname, normalizedUrl);
      links.push(getAlternateEntry(url, 'x-default'));
    }
  }

  return links.join(', ');
}
