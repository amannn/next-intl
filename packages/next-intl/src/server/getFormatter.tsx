import {cache} from 'react';
import {createFormatter} from 'use-intl/dist/src/core';
import getConfig from './getConfig';
import getLocaleFromHeader from './getLocaleFromHeader';

let hasWarned = false;

/**
 * Returns a formatter based on the given locale.
 *
 * The formatter automatically receives the request config, but
 * you can override it by passing in additional options.
 */
const getFormatter = cache(async (opts?: {locale: string}) => {
  if (!opts?.locale && !hasWarned) {
    hasWarned = true;
    console.warn(`
Calling \`getFormatter\` without a locale is deprecated, please update the call:

// app/[locale]/layout.tsx
export async function generateMetadata({params}) {
  const t = await getFormatter({locale: params.locale});

  // ...
}

Learn more: https://next-intl-docs.vercel.app/docs/next-13/server-components#using-internationalization-outside-of-components
`);
  }

  const locale = opts?.locale || getLocaleFromHeader();
  const config = await getConfig(locale);
  return createFormatter({...config, ...opts});
});

export default getFormatter;
