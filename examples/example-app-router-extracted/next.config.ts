import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import {startWatcher} from './watcher';

const withNextIntl = createNextIntlPlugin();
if (process.env.NODE_ENV === 'development') {
  startWatcher();
} else {
  // TODO: One-time compile for build?
  // If yes, we need to ensure this finishes before the build starts
}

function resolve(path: string) {
  return process.env.NODE_ENV === 'development' ? path : require.resolve(path);
}

const config: NextConfig = {
  experimental: {
    swcPlugins: [
      [
        resolve(
          './transform-plugin/target/wasm32-wasip1/debug/transform_plugin.wasm'
        ),
        {}
      ]
    ]
  }
};

export default withNextIntl(config);
