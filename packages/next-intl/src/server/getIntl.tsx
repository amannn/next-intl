import {cache} from 'react';
import {createIntl} from 'use-intl/core';
import {getRequestLocale} from './RequestLocale';
import getConfig from './getConfig';

let hasWarned = false;

/** @deprecated Please switch to `getFormatter`. */
const getIntl = cache(async () => {
  if (process.env.NODE_ENV !== 'production' && !hasWarned) {
    hasWarned = true;
    console.warn(
      `
\`getIntl()\` is deprecated and will be removed in the next major version. Please switch to \`getFormatter()\`.

Learn more: https://next-intl-docs.vercel.app/docs/environments/metadata-route-handlers
`
    );
  }

  const locale = getRequestLocale();
  const config = await getConfig(locale);
  return createIntl(config);
});

export default getIntl;
