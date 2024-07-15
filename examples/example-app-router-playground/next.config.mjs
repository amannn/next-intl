// @ts-check

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.tsx');
export default withNextIntl({
  trailingSlash: process.env.TRAILING_SLASH === 'true',
  experimental: {
    staleTimes: {
      // Next.js 14.2 broke `locale-prefix-never.spec.ts`.
      // This is a workaround for the time being.
      dynamic: 0
    }
  }
});
