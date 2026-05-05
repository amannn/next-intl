import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  experimental: {
    extract: {
      sourceLocale: 'en',
      locales: 'infer',
      srcPath: './src'
    },
    messages: {
      format: 'json',
      path: './messages'
    }
  }
});

const config: NextConfig = {};
export default withNextIntl(config);
