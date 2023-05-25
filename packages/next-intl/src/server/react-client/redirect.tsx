import useClientLocale from '../../client/useClientLocale';
import baseRedirect from '../../shared/redirect';

export default function redirect(pathname: string) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const locale = useClientLocale();
  return baseRedirect(pathname, locale);
}
