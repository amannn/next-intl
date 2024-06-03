import {
  permanentRedirect as nextPermanentRedirect,
  redirect as nextRedirect
} from 'next/navigation';
import {AllLocales, LocalePrefixConfigVerbose} from '../../routing/types';
import {ParametersExceptFirst} from '../../shared/types';
import {getLocalePrefix, isLocalHref, prefixPathname} from '../../shared/utils';

function createRedirectFn(redirectFn: typeof nextRedirect) {
  return function baseRedirect<Locales extends AllLocales>(
    params: {
      pathname: string;
      locale: AllLocales[number];
      localePrefix: LocalePrefixConfigVerbose<Locales>;
    },
    ...args: ParametersExceptFirst<typeof redirectFn>
  ) {
    const prefix = getLocalePrefix(params.locale, params.localePrefix);
    const localizedPathname =
      params.localePrefix.mode === 'never' || !isLocalHref(params.pathname)
        ? params.pathname
        : prefixPathname(prefix, params.pathname);
    return redirectFn(localizedPathname, ...args);
  };
}

export const baseRedirect = createRedirectFn(nextRedirect);
export const basePermanentRedirect = createRedirectFn(nextPermanentRedirect);
