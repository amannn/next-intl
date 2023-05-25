import {redirect as nextRedirect} from 'next/navigation';
import {localizePathname} from '../shared/utils';

export default function redirect(pathname: string, locale: string) {
  const localizedPathname = localizePathname(locale, pathname);
  return nextRedirect(localizedPathname);
}
