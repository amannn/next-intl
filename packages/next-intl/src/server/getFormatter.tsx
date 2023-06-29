import {cache} from 'react';
import {createFormatter} from 'use-intl/dist/src/core';
import getConfig from './getConfig';
import getLocaleFromHeader from './getLocaleFromHeader';

let hasWarnedForMissingLocale = false;
let hasWarnedForObjectArgument = false;

/**
 * Returns a formatter based on the given locale.
 *
 * The formatter automatically receives the request config, but
 * you can override it by passing in additional options.
 */
const getFormatter = cache(async (locale?: string | {locale: string}) => {
  if (typeof locale === 'object') {
    locale = locale.locale;
    if (!hasWarnedForObjectArgument) {
      hasWarnedForObjectArgument = true;
      console.warn(
        `
DEPRECATION WARNING: Calling \`getFormatter\` with an object argument is deprecated, please update your call site accordingly.

// Previously
getFormatter({locale: 'en'});

// Now
getFormatter('en');

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
Calling \`getFormatter\` without a locale is deprecated, please update the call:

// app/[locale]/layout.tsx
export async function generateMetadata({params}) {
  const t = await getFormatter(params.locale);

  // ...
}

Learn more: https://next-intl-docs.vercel.app/docs/next-13/server-components#using-internationalization-outside-of-components
`);
    }
  }

  const config = await getConfig(locale);
  return createFormatter(config);
});

export default getFormatter;
