import {getRequestLocale} from '../../server/react-server/RequestLocaleLegacy.tsx';
import {ParametersExceptFirst} from '../../shared/types.tsx';
import {basePermanentRedirect, baseRedirect} from '../shared/redirects.tsx';

function createRedirectFn(redirectFn: typeof baseRedirect) {
  return function serverRedirect(
    params: Omit<Parameters<typeof redirectFn>[0], 'locale'>,
    ...args: ParametersExceptFirst<typeof redirectFn>
  ) {
    const locale = getRequestLocale();
    return redirectFn({...params, locale}, ...args);
  };
}

export const serverRedirect = createRedirectFn(baseRedirect);
export const serverPermanentRedirect = createRedirectFn(basePermanentRedirect);
