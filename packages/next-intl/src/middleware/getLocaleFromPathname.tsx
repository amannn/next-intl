export default function getLocaleFromPathname(pathname: string) {
  return pathname.split('/')[1];
}
