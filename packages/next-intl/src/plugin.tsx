/* eslint-env node */

import fs from 'fs';
import path from 'path';
import type {NextConfig} from 'next';

function resolveI18nPath(cwd: string, providedPath?: string) {
  let i18nPath = providedPath;

  if (i18nPath) {
    i18nPath = path.resolve(i18nPath);

    if (!fs.existsSync(i18nPath)) {
      throw new Error(
        `Could not find i18n config at ${i18nPath}, please provide a valid path.`
      );
    }
  } else {
    i18nPath = [
      './i18n.tsx',
      './i18n.ts',
      './i18n.js',
      './i18n.jsx',
      './src/i18n.tsx',
      './src/i18n.ts',
      './src/i18n.js',
      './src/i18n.jsx'
    ]
      .map((cur) => path.resolve(cwd, cur))
      .find((cur) => fs.existsSync(cur));

    if (!i18nPath) {
      throw new Error(`\n\nCould not locate i18n config. Create one at \`./(src/)i18n.{js,jsx,ts,tsx}\` or specify a custom location:

const withNextIntl = require('next-intl/plugin')(
  './path/to/i18n.tsx'
);

module.exports = withNextIntl({
  // Other Next.js configuration ...
});\n`);
    }
  }

  return i18nPath;
}

function initPlugin(i18nPath?: string, nextConfig?: NextConfig): NextConfig {
  if (nextConfig?.i18n != null) {
    console.warn(
      "\nnext-intl has found an `i18n` config in your next.config.js. This likely causes conflicts and should therefore be removed if you use the App Router.\n\nIf you're in progress of migrating from the `pages` folder, you can refer to this example: https://github.com/amannn/next-intl/tree/feat/next-13-rsc/packages/example-next-13-with-pages\n"
    );
  }

  return Object.assign({}, nextConfig, {
    webpack(
      ...[config, options]: Parameters<NonNullable<NextConfig['webpack']>>
    ) {
      config.resolve.alias['next-intl/config'] = require.resolve(
        resolveI18nPath(config.context, i18nPath)
      );

      if (typeof nextConfig?.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }

      return config;
    }
  });
}

module.exports = function withNextIntl(i18nPath?: string) {
  return (nextConfig?: NextConfig) => initPlugin(i18nPath, nextConfig);
};
