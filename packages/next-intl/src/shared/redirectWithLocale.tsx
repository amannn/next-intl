import {redirect as nextRedirect} from 'next/navigation';
import {AllLocales, ParametersExceptFirst} from './types';
import {localizePathname} from './utils';

export default function redirectWithLocale(
  pathname: string,
  locale: AllLocales[number],
  ...args: ParametersExceptFirst<typeof nextRedirect>
) {
  const localizedPathname = localizePathname(locale, pathname);
  return nextRedirect(localizedPathname, ...args);
}
