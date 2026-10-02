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

const config: NextConfig = {
  // Set by `tests/webpack-build.spec.ts`
  webpack(webpackConfig) {
    if (process.env.E2E_WEBPACK_DEVTOOL) {
      webpackConfig.devtool = process.env.E2E_WEBPACK_DEVTOOL;
    }
    return webpackConfig;
  }
};
export default withNextIntl(config);
