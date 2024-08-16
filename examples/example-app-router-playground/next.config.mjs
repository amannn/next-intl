// @ts-check

import mdxPlugin from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.tsx');
const withMdx = mdxPlugin();

export default withMdx(
  withNextIntl({
    trailingSlash: process.env.TRAILING_SLASH === 'true',
    experimental: {
      staleTimes: {
        // Next.js 14.2 broke `locale-prefix-never.spec.ts`.
        // This is a workaround for the time being.
        dynamic: 0
      }
    }
  })
);
