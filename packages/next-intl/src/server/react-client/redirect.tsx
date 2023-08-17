import useLocale from '../../react-client/useLocale';
import {ParametersExceptFirstTwo} from '../../shared/types';
import baseRedirect from '../baseRedirect';

export default function redirect(
  pathname: string,
  ...args: ParametersExceptFirstTwo<typeof baseRedirect>
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Reading from context here is fine, since `redirect` should be called during render
  const locale = useLocale();
  return baseRedirect(pathname, locale, ...args);
}
