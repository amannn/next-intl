import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  experimental: {
    srcPath: './src',
    extract: {
      sourceLocale: 'en',
      locales: 'infer'
    },
    messages: {
      path: './messages',
      format: 'po',
      precompile: true
    }
  }
});

const config: NextConfig = {};
export default withNextIntl(config);
