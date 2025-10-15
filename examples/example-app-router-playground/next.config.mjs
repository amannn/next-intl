import createMDX from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';
import createBundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin({
  requestConfig: './src/i18n/request.tsx',
  experimental: {
    createMessagesDeclaration: './messages/en.json'
  }
});
const withMdx = createMDX({});
const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: process.env.NEXT_PUBLIC_USE_CASE === 'trailing-slash',
  basePath:
    process.env.NEXT_PUBLIC_USE_CASE === 'base-path' ? '/base/path' : undefined,
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx']
};

export default withNextIntl(withMdx(withBundleAnalyzer(nextConfig)));
