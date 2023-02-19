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
