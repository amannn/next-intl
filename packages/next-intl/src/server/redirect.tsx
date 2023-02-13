import {redirect as nextRedirect} from 'next/navigation';
import localizePathname from '../shared/localizePathname';
import getLocale from './getLocale';

export default function redirect(pathname: string) {
  const locale = getLocale();
  const localizedPathname = localizePathname(locale, pathname);

  return nextRedirect(localizedPathname);
}
