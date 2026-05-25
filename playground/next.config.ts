import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import { remarkCodeHike, recmaCodeHike, type CodeHikeConfig } from 'codehike/mdx';
import createNextIntlPlugin from 'next-intl/plugin';

const chConfig: CodeHikeConfig = {
  components: { code: 'Code' },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    remarkPlugins: [[remarkCodeHike as any, chConfig]],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recmaPlugins: [[recmaCodeHike as any, chConfig]],
    jsx: true,
  },
});

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default withNextIntl(withMDX(nextConfig as any) as any);
