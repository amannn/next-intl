const withNextIntl = require('next-intl/plugin')();
const routesByLocale = require('./routesByLocale.json');

module.exports = withNextIntl({
  experimental: {appDir: true},

  rewrites() {
    // Routes are set up for the default locale (en) in the app. This
    // rewrites all non-en routes to their internal equivalent.
    const locales = Object.keys(routesByLocale).filter(
      (locale) => locale !== 'en'
    );

    return locales.flatMap((locale) =>
      Object.keys(routesByLocale[locale]).map((routeName) => ({
        source: `/${locale}${routesByLocale[locale][routeName]}`,
        destination: `/${locale}${routesByLocale.en[routeName]}`
      }))
    );
  }
});
