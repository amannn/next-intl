module.exports = {
  experimental: {appDir: true},
  webpack(config) {
    config.resolve.alias['next-intl/config'] =
      require.resolve('./src/i18n.tsx');
    return config;
  }
};
