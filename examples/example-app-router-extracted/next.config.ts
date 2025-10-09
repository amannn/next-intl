import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  experimental: {
    src: './src',
    messages: {
      path: './messages',
      format: 'json'
    },
    extract: {
      sourceLocale: 'en'
    }
  }
});

const config: NextConfig = {};

export default withNextIntl(config);
