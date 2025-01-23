import createMDX from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';
import createBundleAnalyzer from '@next/bundle-analyzer';
import type {NextConfig} from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.tsx');
const withMdx = createMDX({});
const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
});

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  trailingSlash: process.env.NEXT_PUBLIC_USE_CASE === 'trailing-slash',
  basePath:
    process.env.NEXT_PUBLIC_USE_CASE === 'base-path' ? '/base/path' : undefined
};

export default withNextIntl(withMdx(withBundleAnalyzer(nextConfig)));
