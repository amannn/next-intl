module.exports = {
  // intl-messageformat >= 11.2.1 ships ES2022 class static blocks, which the
  // Terser version bundled with Next.js 12 can't parse
  swcMinify: true,
  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  }
};
