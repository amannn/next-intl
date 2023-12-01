import {getRequestLocale} from '../../server/react-server/RequestLocale';
import {LocalePrefix, ParametersExceptFirstTwo} from '../../shared/types';
import baseRedirect from '../shared/baseRedirect';

export default function serverRedirect(
  params: {pathname: string; localePrefix?: LocalePrefix},
  ...args: ParametersExceptFirstTwo<typeof baseRedirect>
) {
  const locale = getRequestLocale();
  return baseRedirect({...params, locale}, ...args);
}
