const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
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

    // Moved pages
    {
      source: '/docs/installation',
      destination: '/docs/getting-started',
      permanent: true
    },
    {
      source: '/docs/configuration',
      destination: '/docs/usage/configuration',
      permanent: true
    },
    {
      source: '/docs/getting-started/production-checklist',
      destination: '/docs/environments/runtime-requirements',
      permanent: true
    },
    {
      source: '/docs/usage/production-checklist',
      destination: '/docs/environments/runtime-requirements',
      permanent: true
    },
    {
      source: '/docs/production-checklist',
      destination: '/docs/environments/runtime-requirements',
      permanent: true
    },
    {
      source: '/docs/next-13',
      destination: '/docs/getting-started',
      permanent: true
    },
    {
      source: '/docs/next-13/client-components',
      destination: '/docs/getting-started/app-router',
      permanent: true
    },
    {
      source: '/docs/next-13/server-components',
      destination: '/docs/getting-started/app-router',
      permanent: true
    },
    {
      source: '/docs/getting-started/app-router-server-components',
      destination: '/docs/getting-started/app-router',
      permanent: true
    },
    {
      source: '/docs/getting-started/app-router-client-components',
      destination: '/docs/getting-started/app-router',
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
      destination: '/docs/workflows/typescript',
      permanent: true
    },
    {
      source: '/docs/typescript',
      destination: '/docs/workflows/typescript',
      permanent: true
    },
    {
      source: '/docs/usage/production-checklist',
      destination: '/docs/environments/runtime-requirements',
      permanent: true
    },
    {
      source: '/docs/usage/runtime-requirements-polyfills',
      destination: '/docs/environments/runtime-requirements',
      permanent: true
    },
    {
      source: '/docs/usage/error-handling',
      destination: '/docs/usage/configuration',
      permanent: true
    },
    {
      source: '/docs/usage/core-library',
      destination: '/docs/environments/core-library',
      permanent: true
    },
    {
      source: '/docs/localization-management',
      destination: '/docs/workflows/localization-management',
      permanent: true
    },
    {
      source: '/examples/next-13',
      destination: '/examples',
      permanent: true
    },
    {
      source: '/examples/minimal',
      destination: '/examples',
      permanent: true
    },
    {
      source: '/examples/advanced',
      destination: '/examples',
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
