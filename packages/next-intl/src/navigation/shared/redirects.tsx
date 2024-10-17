import {
  permanentRedirect as nextPermanentRedirect,
  redirect as nextRedirect
} from 'next/navigation';
import {LocalePrefixConfigVerbose, Locales} from '../../routing/types';
import {ParametersExceptFirst} from '../../shared/types';
import {
  getLocalePrefix,
  isLocalizableHref,
  prefixPathname
} from '../../shared/utils';

function createRedirectFn(redirectFn: typeof nextRedirect) {
  return function baseRedirect<AppLocales extends Locales>(
    params: {
      pathname: string;
      locale: Locales[number];
      localePrefix: LocalePrefixConfigVerbose<AppLocales>;
    },
    ...args: ParametersExceptFirst<typeof redirectFn>
  ) {
    const prefix = getLocalePrefix(params.locale, params.localePrefix);
    const localizedPathname =
      params.localePrefix.mode === 'never' ||
      !isLocalizableHref(params.pathname)
        ? params.pathname
        : prefixPathname(prefix, params.pathname);
    return redirectFn(localizedPathname, ...args);
  };
}

export const baseRedirect = createRedirectFn(nextRedirect);
export const basePermanentRedirect = createRedirectFn(nextPermanentRedirect);
