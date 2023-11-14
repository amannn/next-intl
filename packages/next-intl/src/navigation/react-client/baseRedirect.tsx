import useLocale from '../../react-client/useLocale';
import redirectWithLocale from '../../shared/redirectWithLocale';
import {ParametersExceptFirstTwo} from '../../shared/types';

export default function baseRedirect(
  pathname: string,
  ...args: ParametersExceptFirstTwo<typeof redirectWithLocale>
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

  return redirectWithLocale(pathname, locale, ...args);
}
