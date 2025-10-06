import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const extractorConfig = {
  sourceLocale: 'en',
  srcPath: './src',
  messagesPath: './messages',
  formatter: 'json'
};

const withNextIntl = createNextIntlPlugin({
  experimental: {
    // @ts-expect-error -- This is fine
    extractor: extractorConfig
  }
});

const config: NextConfig = {
  turbopack: {
    rules: {
      // './src/*.{ts,tsx,jsx,js}': (might work in canary)
      '*.{ts,tsx,jsx,js}': {
        loaders: [
          {
            loader: 'next-intl/extractor/extractMessagesLoader',
            options: extractorConfig
          }
        ]
      }
      // '*.json': {
      //   loaders: [
      //     {loader: './extractor/catalog-loader.js', options: extractorConfig}
      //   ],
      //   as: '*.js'
      // }
    }
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(tsx?|jsx?)$/,
      use: [
        {
          loader: 'next-intl/extractor/extractMessagesLoader',
          options: extractorConfig
        }
      ]
    });
    // config.module.rules.push({
    //   test: /\.json$/,
    //   type: 'javascript/auto',
    //   use: [{loader: './extractor/catalog-loader.js', options: extractorConfig}]
    // });

    return config;
  }
};

export default withNextIntl(config);
