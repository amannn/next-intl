import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const config: NextConfig = {
  devIndicators: {
    position: 'bottom-right'
  }
};

export default withNextIntl(config);
