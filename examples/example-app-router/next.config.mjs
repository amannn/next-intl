// @ts-check

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  experimental: {
    createMessagesDeclaration: './messages/en.json'
  }
});

/** @type {import('next').NextConfig} */
const config = {
  experimental: {
    dynamicIO: true,
    ppr: true
  }
};

export default withNextIntl(config);
