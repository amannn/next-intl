const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.js',
  unstable_flexsearch: true,
  unstable_staticImage: true
});

module.exports = withNextra({
  redirects: () => [
    {
      source: '/docs',
      destination: '/docs/getting-started',
      permanent: false
    },
    {
      source: '/docs/installation',
      destination: '/docs/getting-started',
      permanent: false
    },
    {
      source: '/examples',
      destination: '/examples/minimal',
      permanent: false
    }
  ]
});
