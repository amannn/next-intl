import createMDX from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  experimental: {
    extract: {mdx: true},
    srcPath: './src',
    messages: {
      path: './messages',
      format: 'json',
      locales: ['en', 'de'],
      sourceLocale: 'en'
    }
  }
});

const withMDX = createMDX({
  options: {
    recmaPlugins: ['next-intl/extractor/mdx']
  }
});

const config = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx']
};

export default withNextIntl(withMDX(config));
