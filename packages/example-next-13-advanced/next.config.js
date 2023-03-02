const ms = require('ms');
const withNextIntl = require('next-intl/plugin')();

module.exports = withNextIntl({
  experimental: {appDir: true},
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
  },
  headers() {
    return [
      {
        source: '/((?!_next|assets|favicon.ico).*)',
        missing: [
          {
            type: 'header',
            key: 'Next-Router-Prefetch'
          }
        ],
        headers: [
          {
            key: 'Cache-Control',
            value: [
              `s-maxage=` + ms('1d') / 1000,
              `stale-while-revalidate=` + ms('1y') / 1000
            ].join(', ')
          }
        ]
      }
    ];
  }
});
