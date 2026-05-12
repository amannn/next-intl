import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  experimental: {
    extract: true,
    srcPath: './src',
    messages: {
      path: './messages',
      format: 'po',
      locales: 'infer',
      sourceLocale: 'en',
      precompile: true
    }
  }
});

const config: NextConfig = {};
export default withNextIntl(config);
