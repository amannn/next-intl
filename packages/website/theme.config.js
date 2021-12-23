export default {
  github: 'https://github.com/amannn/next-intl',
  projectLink: 'https://github.com/amannn/next-intl',
  // TODO: Update!
  docsRepositoryBase: 'https://github.com/amannn/next-intl/blob/docs/72-improve-docs/pages',
  titleSuffix: ' – next-intl',
  nextLinks: true,
  prevLinks: true,
  search: true,
  customSearch: null,
  darkMode: false,
  footer: true,
  footerText: null,
  footerEditLink: `Edit this page on GitHub`,
  logo: (
    <img
      aria-label="next-intl"
      src="/logo.svg"
      style={{height: 62}}
    />
  ),
  head: () => (
    <>
      <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
      <link rel="manifest" href="/favicon/site.webmanifest" />
      <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#5bbad5" />
      <meta name="msapplication-TileColor" content="#da532c" />
      <meta name="theme-color" content="#ffffff" />

      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="og:title" content="next-intl" />
      <meta name="description" content="A minimal, but complete solution for managing translations, date, time and number formatting in Next.js apps." />
    </>
  )
};
