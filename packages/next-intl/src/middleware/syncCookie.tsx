import {NextRequest, NextResponse} from 'next/server.js';
import {
  InitializedLocaleCookieConfig,
  ResolvedRoutingConfig
} from '../routing/config.tsx';
import {
  DomainConfig,
  DomainsConfig,
  LocalePrefixMode,
  Locales,
  Pathnames
} from '../routing/types.tsx';
import {getAcceptLanguageLocale} from './resolveLocale.tsx';

export default function syncCookie<
  AppLocales extends Locales,
  AppLocalePrefixMode extends LocalePrefixMode,
  AppPathnames extends Pathnames<AppLocales> | undefined,
  AppDomains extends DomainsConfig<AppLocales> | undefined
>(
  request: NextRequest,
  response: NextResponse,
  locale: string,
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
  const acceptLanguageLocale = getAcceptLanguageLocale(
    request.headers,
    domain?.locales || routing.locales,
    routing.defaultLocale
  );
  const hasOutdatedCookie = request.cookies.get(name)?.value !== locale;

  if (acceptLanguageLocale !== locale && hasOutdatedCookie) {
    response.cookies.set(name, locale, {
      path: request.nextUrl.basePath || undefined,
      ...rest
    });
  }
}
