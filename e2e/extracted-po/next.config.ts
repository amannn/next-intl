import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  experimental: {
    extract: {
      locales: 'infer',
      sourceLocale: 'en',
      srcPath: './src'
    },
    messages: {
      format: 'po',
      path: './messages'
    }
  }
});

const config: NextConfig = {};
export default withNextIntl(config);
