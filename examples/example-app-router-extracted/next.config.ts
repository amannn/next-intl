import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  experimental: {
    srcPath: './src',
    extract: {
      sourceLocale: 'en'
    },
    messages: {
      path: './messages',
      format: 'po',
      locales: 'infer'
    }
  }
});

const config: NextConfig = {};
export default withNextIntl(config);
