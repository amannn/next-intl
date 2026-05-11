import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  experimental: {
    extract: {
      // Necessary to extract first-party messages
      path: './messages'
    },
    messages: {
      // This is necessary to transform .po files
      path: ['./messages', '../shared-ui/messages'],
      format: 'po',
      locales: 'infer',
      sourceLocale: 'en'
    },
    srcPath: './src'
  }
});

const nextConfig: NextConfig = {
  // Compile `useExtracted` to `useTranslations`
  transpilePackages: ['e2e-shared-ui']
};

export default withNextIntl(nextConfig);
