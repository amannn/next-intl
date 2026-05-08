import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import { remarkCodeHike, recmaCodeHike, type CodeHikeConfig } from 'codehike/mdx';
// NOTE: import kept for when withNextIntl is re-enabled in a later task.
import createNextIntlPlugin from 'next-intl/plugin';

const chConfig: CodeHikeConfig = {
  components: { code: 'Code' },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [[remarkCodeHike, chConfig]],
    recmaPlugins: [[recmaCodeHike, chConfig]],
    jsx: true,
  },
});

// NOTE: withNextIntl is commented out until src/i18n/request.ts is created in a later task.
// const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
};

export default withMDX(nextConfig);
