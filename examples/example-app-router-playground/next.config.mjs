// @ts-check

import mdxPlugin from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.tsx');
const withMdx = mdxPlugin();

export default withMdx(
  withNextIntl({
    trailingSlash: process.env.NEXT_PUBLIC_USE_CASE === 'trailing-slash',
    basePath: process.env.NEXT_PUBLIC_USE_CASE === 'base-path' ? '/base/path' : undefined,
    experimental: {
      staleTimes: {
        // Next.js 14.2 broke `locale-prefix-never.spec.ts`.
        // This is a workaround for the time being.
        dynamic: 0
      }
    }
  })
);
