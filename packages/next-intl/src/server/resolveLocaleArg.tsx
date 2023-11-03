import getLocale from './getLocale';

export default function resolveLocaleArg(
  fnName: string,
  optsOrDeprecatedLocale?: {locale?: string} | string
) {
  if (typeof optsOrDeprecatedLocale === 'string') {
    console.error(
      `\nDEPRECATION WARNING: Passing a locale as a string to \`${fnName}\` is deprecated and will be removed as part of the stable release. Please pass an object with a \`locale\` property instead. See LINK_TO_PR\n`
      // TODO: Codemod
    );
    return optsOrDeprecatedLocale;
  }

  if (optsOrDeprecatedLocale?.locale) {
    return optsOrDeprecatedLocale.locale;
  }

  return getLocale();
}
