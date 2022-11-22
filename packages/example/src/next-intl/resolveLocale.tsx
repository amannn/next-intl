import acceptLanguageParser from 'accept-language-parser';

type I18nConfig = {
  locales: Array<string>;
  defaultLocale: string;
};

export default function resolveLocale(
  requestHeaders: Headers,
  i18n: I18nConfig
) {
  const locale =
    acceptLanguageParser.pick(
      i18n.locales,
      requestHeaders.get('accept-language') || i18n.defaultLocale
    ) || i18n.defaultLocale;

  return locale;
}
