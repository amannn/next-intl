import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  experimental: {
    // Single shared catalog at the workspace root: both apps and the shared
    // `packages/ui` write/read from `examples/example-expo-monorepo/messages/`.
    extract: {path: '../../messages'},
    srcPath: ['./src', '../mobile/src', '../../packages/ui/src'],
    messages: {
      path: '../../messages',
      format: 'po',
      locales: ['en', 'de'],
      sourceLocale: 'en',
      precompile: true
    }
  }
});

const config: NextConfig = {
  // `@example-monorepo/ui` ships TSX directly — let Next.js transpile it.
  transpilePackages: ['@example-monorepo/ui']
};

export default withNextIntl(config);
