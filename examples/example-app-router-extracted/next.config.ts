import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import {startNextJsWatcher} from './watcher';

// const profile = 'debug';
const profile = 'release';

const withNextIntl = createNextIntlPlugin();
if (process.env.NODE_ENV === 'development') {
  startNextJsWatcher();
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
          `./transform-plugin/target/wasm32-wasip1/${profile}/transform_plugin.wasm`
        ),
        {}
      ]
    ]
  }
};

export default withNextIntl(config);
