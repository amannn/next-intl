import useLocale from '../../react-client/useLocale';
import {ParametersExceptFirstTwo} from '../../shared/types';
import baseRedirect from '../baseRedirect';

export default function redirect(
  pathname: string,
  ...args: ParametersExceptFirstTwo<typeof baseRedirect>
) {
  let locale;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Reading from context here is fine, since `redirect` should be called during render
    locale = useLocale();
  } catch (e) {
    throw new Error(
      process.env.NODE_ENV !== 'production'
        ? '`redirect()` can only be called during render. To redirect in an event handler or similar, you can use `useRouter()` instead.'
        : undefined
    );
  }

  return baseRedirect(pathname, locale, ...args);
}
