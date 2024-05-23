import {
  permanentRedirect as nextPermanentRedirect,
  redirect as nextRedirect
} from 'next/navigation';
import {
  AllLocales,
  LocalePrefix,
  ParametersExceptFirst,
  RoutingLocales
} from '../../shared/types';
import {isLocalHref, prefixPathname} from '../../shared/utils';
import {getLocalePrefix} from './utils';

function createRedirectFn(redirectFn: typeof nextRedirect) {
  return function baseRedirect<Locales extends AllLocales>(
    params: {
      pathname: string;
      locale: AllLocales[number];
      localePrefix?: LocalePrefix;
      locales?: RoutingLocales<Locales>;
    },
    ...args: ParametersExceptFirst<typeof redirectFn>
  ) {
    const prefix = getLocalePrefix(params.locale, params.locales);
    const localizedPathname =
      params.localePrefix === 'never' || !isLocalHref(params.pathname)
        ? params.pathname
        : prefixPathname(prefix, params.pathname);
    return redirectFn(localizedPathname, ...args);
  };
}

export const baseRedirect = createRedirectFn(nextRedirect);
export const basePermanentRedirect = createRedirectFn(nextPermanentRedirect);
