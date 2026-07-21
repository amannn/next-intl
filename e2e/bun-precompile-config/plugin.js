import createNextIntlPlugin from 'next-intl/plugin';

// A shared wrapper around `next-intl/plugin`, as commonly used in monorepos to
// centralize i18n config. Importing `next-intl/plugin` through a workspace
// package like this causes the bundler to inline `next-intl` into the bundled
// `next.config`, which is what surfaces the module resolution issue that this
// setup reproduces (see the app's `next.config.ts`).
export function withI18n(nextConfig) {
  const withNextIntl = createNextIntlPlugin({
    experimental: {
      messages: {
        path: './messages',
        format: 'json',
        // Precompilation is what triggers the `use-intl/format-message` alias
        precompile: true
      }
    }
  });
  return withNextIntl(nextConfig);
}
