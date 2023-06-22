import {cache} from 'react';
import {createIntl} from 'use-intl/dist/src/core';
import getConfig from './getConfig';
import getLocaleFromHeader from './getLocaleFromHeader';

let hasWarned = false;

/** @deprecated Please switch to `getFormatter`. */
const getIntl = cache(async () => {
  if (!hasWarned) {
    hasWarned = true;
    console.warn(
      `
\`getIntl()\` is deprecated and will be removed in the next major version. Please switch to \`getFormatter()\`.

Learn more: https://next-intl-docs.vercel.app/docs/next-13/server-components#using-internationalization-outside-of-components
`
    );
  }

  const locale = getLocaleFromHeader();
  const config = await getConfig(locale);
  return createIntl(config);
});

export default getIntl;
