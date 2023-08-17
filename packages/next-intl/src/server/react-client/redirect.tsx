import useLocale from '../../react-client/useLocale';
import {ParametersExceptFirstTwo} from '../../shared/types';
import baseRedirect from '../baseRedirect';

export default function redirect(
  pathname: string,
  ...args: ParametersExceptFirstTwo<typeof baseRedirect>
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Reading from context conditionally is fine
  const locale = useLocale();
  return baseRedirect(pathname, locale, ...args);
}
