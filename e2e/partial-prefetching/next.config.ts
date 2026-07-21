import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

// See https://nextjs.org/blog/next-16-3-instant-navigations
const config: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true
};

// This app is intentionally pinned to a 16.3 canary of Next.js, while
// the plugin types resolve to the `next` version of the monorepo (16.2)
export default withNextIntl(config as Parameters<typeof withNextIntl>[0]);
