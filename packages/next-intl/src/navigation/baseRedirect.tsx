import {redirect as nextRedirect} from 'next/navigation';
import {AllLocales, ParametersExceptFirst} from '../shared/types';
import {localizePathname} from '../shared/utils';

export default function baseRedirect(
  pathname: string,
  locale: AllLocales[number],
  ...args: ParametersExceptFirst<typeof nextRedirect>
) {
  const localizedPathname = localizePathname(locale, pathname);
  return nextRedirect(localizedPathname, ...args);
}
