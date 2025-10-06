import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import {type ExtractorConfig} from './extractor/catalog/CatalogManager.ts';

const withNextIntl = createNextIntlPlugin();

const extractorConfig: ExtractorConfig = {
  sourceLocale: 'en',
  srcPath: './src',
  messagesPath: './messages',
  formatter: 'json'
};

const config: NextConfig = {
  turbopack: {
    rules: {
      // './src/*.{ts,tsx,jsx,js}': (might work in canary)
      '*.{ts,tsx,jsx,js}': {
        loaders: [
          {
            loader: './extractor/dist/index.js',
            options: extractorConfig
          }
        ]
      },
      '*.json': {
        loaders: [
          {loader: './extractor/catalog-loader.js', options: extractorConfig}
        ],
        as: '*.js'
      }
    }
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(tsx?|jsx?)$/,
      use: [
        {
          loader: './extractor/dist/index.js',
          options: extractorConfig
        }
      ]
    });
    config.module.rules.push({
      test: /\.json$/,
      type: 'javascript/auto',
      use: [{loader: './extractor/catalog-loader.js', options: extractorConfig}]
    });

    return config;
  }
};

export default withNextIntl(config);
