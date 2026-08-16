import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  experimental: {
    extract: {
      split: 'namespace'
    },
    srcPath: './src',
    messages: {
      path: './messages',
      format: 'po',
      locales: 'infer',
      sourceLocale: 'en'
    }
  }
});

const config: NextConfig = {};
export default withNextIntl(config);
