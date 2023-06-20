const withNextIntl = require('next-intl/plugin')();

module.exports = withNextIntl({
  rewrites() {
    return [
      {
        source: '/de/verschachtelt',
        destination: '/de/nested'
      },
      {
        source: '/es/anidada',
        destination: '/es/nested'
      }
    ];
  }
});
