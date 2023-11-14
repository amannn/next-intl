import {getRequestLocale} from '../../server/RequestLocale';
import redirectWithLocale from '../../shared/redirectWithLocale';
import {ParametersExceptFirstTwo} from '../../shared/types';

export default function baseRedirect(
  pathname: string,
  ...args: ParametersExceptFirstTwo<typeof redirectWithLocale>
) {
  const locale = getRequestLocale();
  return redirectWithLocale(pathname, locale, ...args);
}
