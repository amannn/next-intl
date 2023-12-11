import {getRequestLocale} from '../../server/react-server/RequestLocale';
import {LocalePrefix, ParametersExceptFirst} from '../../shared/types';
import baseRedirect from '../shared/baseRedirect';

export default function serverRedirect(
  params: {pathname: string; localePrefix?: LocalePrefix},
  ...args: ParametersExceptFirst<typeof baseRedirect>
) {
  const locale = getRequestLocale();
  return baseRedirect({...params, locale}, ...args);
}
