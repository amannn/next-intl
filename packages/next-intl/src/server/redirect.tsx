import {ParametersExceptFirstTwo} from '../shared/types';
import {getRequestLocale} from './RequestLocale';
import baseRedirect from './baseRedirect';

export default function redirect(
  pathname: string,
  ...args: ParametersExceptFirstTwo<typeof baseRedirect>
) {
  const locale = getRequestLocale();
  return baseRedirect(pathname, locale, ...args);
}
