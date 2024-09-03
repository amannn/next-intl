import {
  permanentRedirect as nextPermanentRedirect,
  redirect as nextRedirect
} from 'next/navigation';
import {Locales, LocalePrefixConfigVerbose} from '../../routing/types';
import {ParametersExceptFirst} from '../../shared/types';
import {applyPathnamePrefix} from './utils';

function createRedirectFn(redirectFn: typeof nextRedirect) {
  return function baseRedirect<AppLocales extends Locales>(
    params: {
      pathname: string;
      locale: Locales[number];
      localePrefix: LocalePrefixConfigVerbose<AppLocales>;
    },
    ...args: ParametersExceptFirst<typeof redirectFn>
  ) {
    return redirectFn(
      applyPathnamePrefix({
        ...params,
        curLocale: params.locale,
        // TODO: Refactor fn signature to reduce bundle size?
        routing: {localePrefix: params.localePrefix}
      }),
      ...args
    );
  };
}

export const baseRedirect = createRedirectFn(nextRedirect);
export const basePermanentRedirect = createRedirectFn(nextPermanentRedirect);
