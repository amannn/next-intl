import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  experimental: {
    // Necessary to extract first-party messages
    srcPath: './src',
    extract: {
      locales: 'infer',
      path: './messages',
      sourceLocale: 'en'
    },

    messages: {
      format: 'po',
      // This is necessary to transform .po files
      path: ['./messages', '../shared-ui/messages']
    }
  }
});

const nextConfig: NextConfig = {
  // Compile `useExtracted` to `useTranslations`
  transpilePackages: ['e2e-shared-ui']
};

export default withNextIntl(nextConfig);
