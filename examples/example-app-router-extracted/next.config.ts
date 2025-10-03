import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import {type ExtractorConfig} from './extractor/catalog/CatalogManager.ts';

const withNextIntl = createNextIntlPlugin();

const extractorConfig: ExtractorConfig = {
  sourceLocale: 'en',
  messagesPath: './messages',
  srcPath: './src',
  formatter: 'json'
};

function createExtractorRule() {
  return {
    loaders: [
      {
        loader: './extractor/dist/index.js',
        options: extractorConfig
      }
    ]
  };
}

const config: NextConfig = {
  turbopack: {
    rules: {
      '*.tsx': createExtractorRule(),
      '*.ts': createExtractorRule(),
      '*.jsx': createExtractorRule(),
      '*.js': createExtractorRule()
    }
  },
  webpack(config) {
    // Add the extractor loader for production builds
    config.module.rules.push({
      test: /\.(tsx?|jsx?)$/,
      use: [
        {
          loader: './extractor/dist/index.js',
          options: extractorConfig
        }
      ]
    });

    return config;
  }
};

export default withNextIntl(config);
