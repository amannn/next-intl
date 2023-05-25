import baseRedirect from '../shared/redirect';
import getLocale from './getLocale';

export default function redirect(pathname: string) {
  const locale = getLocale();
  return baseRedirect(pathname, locale);
}
