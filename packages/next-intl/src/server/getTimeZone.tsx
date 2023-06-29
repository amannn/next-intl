import {cache} from 'react';
import getConfig from './getConfig';
import getLocaleFromHeader from './getLocaleFromHeader';

let hasWarnedForMissingLocale = false;
let hasWarnedForObjectArgument = false;

const getTimeZone = cache(async (locale?: string | {locale: string}) => {
  if (typeof locale === 'object') {
    locale = locale.locale;
    if (!hasWarnedForObjectArgument) {
      hasWarnedForObjectArgument = true;
      console.warn(
        `
DEPRECATION WARNING: Calling \`getTimeZone\` with an object argument is deprecated, please update your call site accordingly.

// Previously
getTimeZone({locale: 'en'});

// Now
getTimeZone('en');

See also https://next-intl-docs.vercel.app/docs/next-13/server-components#using-internationalization-outside-of-components
`
      );
    }
  }

  if (!locale) {
    locale = getLocaleFromHeader();
    if (!hasWarnedForMissingLocale) {
      hasWarnedForMissingLocale = true;
      console.warn(`
Calling \`getTimeZone\` without a locale is deprecated, please update the call:

// app/[locale]/layout.tsx
export async function generateMetadata({params}) {
  const t = await getTimeZone(params.locale);

  // ...
}

Learn more: https://next-intl-docs.vercel.app/docs/next-13/server-components#using-internationalization-outside-of-components
`);
    }
  }

  const config = await getConfig(locale);
  return config.timeZone;
});

export default getTimeZone;
