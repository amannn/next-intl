import useLocale from '../../react-client/useLocale';
import {ParametersExceptFirst} from '../../shared/types';
import {baseRedirect, basePermanentRedirect} from '../shared/redirects';

function createRedirectFn(redirectFn: typeof baseRedirect) {
  return function clientRedirect(
    params: Omit<Parameters<typeof redirectFn>[0], 'locale'>,
    ...args: ParametersExceptFirst<typeof redirectFn>
  ) {
    let locale;
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks -- Reading from context here is fine, since `redirect` should be called during render
      locale = useLocale();
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        throw new Error(
          '`redirect()` and `permanentRedirect()` can only be called during render. To redirect in an event handler or similar, you can use `useRouter()` instead.'
        );
      }
      throw e;
    }

    return redirectFn({...params, locale}, ...args);
  };
}

export const clientRedirect = createRedirectFn(baseRedirect);
export const clientPermanentRedirect = createRedirectFn(basePermanentRedirect);
