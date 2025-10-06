import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  experimental: {
    extractor: {
      sourceLocale: 'en',
      srcPath: './',
      messagesPath: './messages',
      formatter: 'json'
    }
  }
});

const config: NextConfig = {};

export default withNextIntl(config);
