import {
  permanentRedirect as nextPermanentRedirect,
  redirect as nextRedirect
} from 'next/navigation';
import {Locales, LocalePrefixConfigVerbose} from '../../routing/types';
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

    // This logic is considered legacy and is replaced by `applyPathnamePrefix`.
    // We keep it this way for now for backwards compatibility.
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
