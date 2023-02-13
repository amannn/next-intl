export default function hasPathnamePrefixed(locale: string, pathname: string) {
  const prefix = `/${locale}`;
  return (
    pathname === prefix ||
    (pathname.startsWith(`${prefix}/`) && pathname.length > prefix.length)
  );
}
