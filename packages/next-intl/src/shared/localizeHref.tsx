export default function localizeHref(locale: string, href: string) {
  let localizedHref = '/' + locale;

  if (href !== '/') {
    localizedHref += href;
  }

  return localizedHref;
}
