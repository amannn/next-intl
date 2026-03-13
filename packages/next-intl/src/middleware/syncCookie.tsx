import type {NextRequest, NextResponse} from 'next/server.js';
import type {Locale} from 'use-intl';
import type {
  InitializedLocaleCookieConfig,
  ResolvedRoutingConfig
} from '../routing/config.js';
import type {
  DomainConfig,
  DomainsConfig,
  LocalePrefixMode,
  Locales,
  Pathnames
} from '../routing/types.js';
import {getAcceptLanguageLocale} from './resolveLocale.js';

export default function syncCookie<
  AppLocales extends Locales,
  AppLocalePrefixMode extends LocalePrefixMode,
  AppPathnames extends Pathnames<AppLocales> | undefined,
  AppDomains extends DomainsConfig<AppLocales> | undefined
>(
  request: NextRequest,
  response: NextResponse,
  locale: Locale,
  routing: Pick<
    ResolvedRoutingConfig<
      AppLocales,
      AppLocalePrefixMode,
      AppPathnames,
      AppDomains
    >,
    'locales' | 'defaultLocale'
  > & {
    localeCookie: InitializedLocaleCookieConfig;
  },
  domain?: DomainConfig<AppLocales>
) {
  if (!routing.localeCookie) return;

  const {name, ...rest} = routing.localeCookie;
  const hasLocaleCookie = request.cookies.has(name);
  const hasOutdatedCookie =
    hasLocaleCookie && request.cookies.get(name)?.value !== locale;

  if (hasOutdatedCookie) {
    response.cookies.set(name, locale, {
      path: request.nextUrl.basePath || undefined,
      ...rest
    });
  } else if (!hasLocaleCookie) {
    const acceptLanguageLocale = getAcceptLanguageLocale(
      request.headers,
      domain?.locales || routing.locales,
      routing.defaultLocale
    );
    if (acceptLanguageLocale !== locale) {
      response.cookies.set(name, locale, {
        path: request.nextUrl.basePath || undefined,
        ...rest
      });
    }
  }
}
