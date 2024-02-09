import {getRequestLocale} from '../../server/react-server/RequestLocale';
import {LocalePrefix, ParametersExceptFirst} from '../../shared/types';
import basePermanentRedirect from '../shared/basePermanentRedirect';

export default function serverPermanentRedirect(
  params: {pathname: string; localePrefix?: LocalePrefix},
  ...args: ParametersExceptFirst<typeof basePermanentRedirect>
) {
  const locale = getRequestLocale();
  return basePermanentRedirect({...params, locale}, ...args);
}
