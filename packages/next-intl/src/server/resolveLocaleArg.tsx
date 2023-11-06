import {cache} from 'react';
import getLocale from './getLocale';

// TODO: Remove

const deprecate = cache((fnName: string, locale: string) => {
  console.error(
    `\nDEPRECATION WARNING: Passing a locale as a string to \`${fnName}\` has been deprecated in favor of passing an object with a \`locale\` property instead:

${fnName}({locale: '${locale}'});

See https://github.com/amannn/next-intl/pull/600\n`
  );
});

export default function resolveLocaleArg(
  fnName: string,
  optsOrDeprecatedLocale?: {locale?: string} | string
) {
  if (typeof optsOrDeprecatedLocale === 'string') {
    deprecate(fnName, optsOrDeprecatedLocale);
    return optsOrDeprecatedLocale;
  }

  if (optsOrDeprecatedLocale?.locale) {
    return optsOrDeprecatedLocale.locale;
  }

  return getLocale();
}
