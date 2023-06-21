import baseRedirect from '../shared/redirect';
import getLocaleFromHeader from './getLocaleFromHeader';

export default function redirect(pathname: string) {
  const locale = getLocaleFromHeader();
  return baseRedirect(pathname, locale);
}
