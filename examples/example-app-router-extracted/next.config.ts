import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import {type ExtractorConfig} from './extractor/catalog/CatalogManager.ts';

const withNextIntl = createNextIntlPlugin();

const config: NextConfig = {
  turbopack: {
    rules: {
      // TODO: How to target all JS extensions?
      '*.tsx': {
        loaders: [
          {
            loader: './extractor/dist/index.js',
            options: {
              sourceLocale: 'en',
              messagesPath: './messages',
              srcPath: './src',
              formatter: 'json'
            } satisfies ExtractorConfig
          }
        ]
      }
    }
  }
};

export default withNextIntl(config);
