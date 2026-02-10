import createMDX from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';
import createBundleAnalyzer from '@next/bundle-analyzer';
import path from 'path';
import {NextConfig} from 'next';

const withNextIntl = createNextIntlPlugin({
  requestConfig: './src/i18n/request.tsx',
  experimental: {
    createMessagesDeclaration: './messages/en.json',
    srcPath: './src',
    treeShaking: true
  }
});
const withMdx = createMDX({});
const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
});

const nextConfig: NextConfig = {
  trailingSlash: process.env.NEXT_PUBLIC_USE_CASE === 'trailing-slash',
  basePath:
    process.env.NEXT_PUBLIC_USE_CASE === 'base-path' ? '/base/path' : undefined,
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  turbopack: {
    resolveAlias: {
      'next-intl/_client-manifest.json':
        './node_modules/.cache/next-intl-client-manifest.json'
    }
  },
  webpack(config) {
    config.resolve.alias['next-intl/_client-manifest.json'] = path.join(
      __dirname,
      'node_modules',
      '.cache',
      'next-intl-client-manifest.json'
    );
    return config;
  }
};

export default withNextIntl(withMdx(withBundleAnalyzer(nextConfig)));
