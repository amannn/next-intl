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
  redirects: () => [
    // Index pages
    {
      source: '/docs',
      destination: '/docs/getting-started',
      permanent: false
    },
    {
      source: '/examples',
      destination: '/examples/next-13',
      permanent: false
    },

    // Moved pages
    {
      source: '/docs/installation',
      destination: '/docs/getting-started',
      permanent: true
    },
    {
      source: '/docs/getting-started/production-checklist',
      destination: '/docs/production-checklist',
      permanent: true
    },
    {
      source: '/docs/usage/production-checklist',
      destination: '/docs/production-checklist',
      permanent: true
    },
    {
      source: '/docs/next-13',
      destination: '/docs/getting-started',
      permanent: true
    },
    {
      source: '/docs/next-13/client-components',
      destination: '/docs/getting-started/app-router-client-components',
      permanent: true
    },
    {
      source: '/docs/next-13/server-components',
      destination: '/docs/getting-started/app-router-server-components',
      permanent: true
    },
    {
      source: '/docs/next-13/middleware',
      destination: '/docs/routing/middleware',
      permanent: true
    },
    {
      source: '/docs/next-13/navigation',
      destination: '/docs/routing/navigation',
      permanent: true
    },
    {
      source: '/docs/usage/typescript',
      destination: '/docs/typescript',
      permanent: true
    },
    {
      source: '/docs/usage/production-checklist',
      destination: '/docs/production-checklist',
      permanent: true
    },
    {
      source: '/docs/usage/runtime-requirements-polyfills',
      destination: '/docs/production-checklist#runtime-requirements',
      permanent: true
    },
    {
      source: '/docs/usage/configuration',
      destination: '/docs/configuration',
      permanent: true
    },
    {
      source: '/docs/usage/error-handling',
      destination: '/docs/configuration#error-handling',
      permanent: true
    },
    {
      source: '/examples/next-13',
      destination: '/examples/app-router',
      permanent: true
    },
    {
      source: '/examples/minimal',
      destination: '/examples/pages-router',
      permanent: true
    },
    {
      source: '/examples/advanced',
      destination: '/examples/pages-router-advanced',
      permanent: true
    }
  ],

  ...(process.env.UMAMI_URL && {
    rewrites: () => [
      {
        source: '/u/:match*',
        destination: process.env.UMAMI_URL + '/:match*'
      }
    ]
  })
});
