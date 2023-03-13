const withNextIntl = require('next-intl/plugin')();
const routes = require('./routes.json');

function createLocaleRewrites(locale) {
  return Object.keys(routes[locale]).map((namedRoute) => ({
    source: `/${locale}${routes[locale][namedRoute]}`,
    destination: `/${locale}${routes.en[namedRoute]}`
  }));
}

module.exports = withNextIntl({
  experimental: {appDir: true},
  rewrites() {
    return Object.keys(routes).flatMap((locale) =>
      createLocaleRewrites(locale)
    );
  }
});
