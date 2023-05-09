export default function unlocalizePathname(pathname: string, locale: string) {
  return pathname.replace(new RegExp(`^/${locale}`), '') || '/';
}
