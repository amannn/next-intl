import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import {startNextJsWatcher} from './extractor';

const withNextIntl = createNextIntlPlugin();
if (process.env.NODE_ENV === 'development') {
  startNextJsWatcher();
} else {
  // TODO: One-time compile for build?
  // If yes, we need to ensure this finishes before the build starts
}

const config: NextConfig = {
  experimental: {
    swcPlugins: [
      [
        'next-intl-extracted/target/wasm32-wasip1/release/next_intl_extracted_swc_plugin.wasm',
        {}
      ]
    ]
  }
};

export default withNextIntl(config);
