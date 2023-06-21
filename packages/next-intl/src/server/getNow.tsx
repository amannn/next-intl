import {cache} from 'react';
import getConfig from './getConfig';

let hasWarned = false;

const getNow = cache(async (opts?: {locale: string}) => {
  if (!opts?.locale && !hasWarned) {
    hasWarned = true;
    console.warn(`
Calling \`getNow\` without a locale is deprecated. Please update the call:

// app/[locale]/layout.tsx
export async function generateMetadata({params}) {
  const t = await getNow({locale: params.locale});

  // ...
}

Learn more: https://next-intl-docs.vercel.app/docs/next-13/server-components#using-internationalization-outside-of-components
`);
  }

  const config = await getConfig(opts?.locale);
  return config.now;
});

export default getNow;
