import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  requestConfig: './src/i18n/request.ts',
  experimental: {
    extract: true,
    srcPath: './src',
    messages: {
      path: './messages',
      format: 'po',
      locales: 'infer',
      sourceLocale: 'en',
      precompile: true
    }
  }
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withNextIntl(nextConfig);
