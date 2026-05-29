import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  experimental: {
    extract: true,
    srcPath: './src',
    messages: {
      path: './messages',
      format: 'json',
      locales: 'infer',
      sourceLocale: 'en'
    }
  }
});

const config: NextConfig = {};
export default withNextIntl(config);
