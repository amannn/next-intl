import createMDX from '@next/mdx';
import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  experimental: {
    extract: {mdx: true},
    srcPath: './src',
    messages: {
      path: './messages',
      format: 'json',
      locales: 'infer',
      sourceLocale: 'en'
    }
  }
});

const withMDX = createMDX({
  options: {recmaPlugins: ['next-intl/extractor/mdx']}
});

const config: NextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  // Set by `tests/build.spec.ts`
  webpack(webpackConfig, {isServer, defaultLoaders}) {
    // @next/mdx currently uses a layer-less SWC loader, which rejects even
    // server metadata. Keep this upstream workaround local to the fixture.
    // https://github.com/vercel/next.js/issues/91735
    if (isServer) {
      for (const rule of webpackConfig.module.rules) {
        if (
          rule?.test instanceof RegExp &&
          rule.test.test('page.mdx') &&
          Array.isArray(rule.use) &&
          rule.use.includes(defaultLoaders.babel)
        ) {
          rule.use = rule.use.map((loader: typeof defaultLoaders.babel) =>
            loader === defaultLoaders.babel
              ? {...loader, options: {...loader.options, bundleLayer: 'rsc'}}
              : loader
          );
        }
      }
    }
    if (process.env.E2E_WEBPACK_DEVTOOL) {
      webpackConfig.devtool = process.env.E2E_WEBPACK_DEVTOOL;
    }
    return webpackConfig;
  }
};
export default withNextIntl(withMDX(config));
