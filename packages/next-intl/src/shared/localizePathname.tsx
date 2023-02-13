export default function localizePathname(locale: string, pathname: string) {
  let localizedHref = '/' + locale;

  if (pathname !== '/') {
    localizedHref += pathname;
  }

  return localizedHref;
}
