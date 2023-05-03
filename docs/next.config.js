const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.js',
  staticImage: true,
  defaultShowCopyCode: true,
  flexsearch: {
    codeblocks: false
  }
});

module.exports = withNextra({
  experimental: {
    appDir: true
  },
  redirects: () => [
    // Index pages
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
    },

    // Moved pages
    {
      source: '/docs/getting-started/production-checklist',
      destination: '/docs/usage/production-checklist',
      permanent: true
    },
    {
      source: '/docs/production-checklist',
      destination: '/docs/usage/production-checklist',
      permanent: true
    }
  ],

  ...(process.env.UMAMI_URL && {
    rewrites: () => [
      {
        source: '/stats/:match*',
        destination: process.env.UMAMI_URL + '/:match*'
      }
    ]
  })
});
