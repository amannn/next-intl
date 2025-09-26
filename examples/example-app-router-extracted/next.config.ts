import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

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
