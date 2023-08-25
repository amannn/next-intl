import {ParametersExceptFirstTwo} from '../shared/types';
import baseRedirect from './baseRedirect';
import getLocaleFromHeader from './getLocaleFromHeader';

export default function redirect(
  pathname: string,
  ...args: ParametersExceptFirstTwo<typeof baseRedirect>
) {
  const locale = getLocaleFromHeader();
  return baseRedirect(pathname, locale, ...args);
}
