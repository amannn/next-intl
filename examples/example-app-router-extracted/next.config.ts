import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const config: NextConfig = {
  experimental: {
    // swcPlugins
  }
};

export default withNextIntl(config);
