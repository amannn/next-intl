import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const config: NextConfig = {
  // https://github.com/amannn/next-intl/issues/2121
  transpilePackages: ['next-intl']
};

export default withNextIntl(config);
