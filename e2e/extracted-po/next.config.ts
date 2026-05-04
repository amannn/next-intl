import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  experimental: {
    srcPath: './src',
    extract: {
      locales: 'infer',
      sourceLocale: 'en'
    },
    messages: {
      format: 'po',
      path: './messages'
    }
  }
});

const config: NextConfig = {};
export default withNextIntl(config);
