import createMDX from '@next/mdx';
import {remarkCodeHike, recmaCodeHike} from 'codehike/mdx';
import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('codehike/mdx').CodeHikeConfig} */
const chConfig = {
  components: {code: 'Code'}
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [[remarkCodeHike, chConfig]],
    recmaPlugins: [[recmaCodeHike, chConfig]],
    jsx: true
  }
});

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx']
};

export default withNextIntl(withMDX(nextConfig));
