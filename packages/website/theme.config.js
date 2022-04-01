/* eslint-disable @next/next/no-img-element */
export default {
  github: 'https://github.com/amannn/next-intl',
  projectLink: 'https://github.com/amannn/next-intl',
  docsRepositoryBase:
    'https://github.com/amannn/next-intl/tree/main/packages/website/pages',
  titleSuffix: ' – next-intl',
  nextLinks: true,
  prevLinks: true,
  search: true,
  customSearch: null,
  darkMode: false,
  footer: true,
  footerText: null,
  footerEditLink: `Edit this page on GitHub`,
  logo: <img aria-label="next-intl" src="/logo.svg" style={{height: 62}} />,
  head: () => (
    <>
      <link
        href="/favicon/apple-touch-icon.png"
        rel="apple-touch-icon"
        sizes="180x180"
      />
      <link
        href="/favicon/favicon-32x32.png"
        rel="icon"
        sizes="32x32"
        type="image/png"
      />
      <link
        href="/favicon/favicon-16x16.png"
        rel="icon"
        sizes="16x16"
        type="image/png"
      />
      <link href="/favicon/site.webmanifest" rel="manifest" />
      <link
        color="#5bbad5"
        href="/favicon/safari-pinned-tab.svg"
        rel="mask-icon"
      />
      <meta content="#da532c" name="msapplication-TileColor" />
      <meta content="#ffffff" name="theme-color" />

      <meta content="next-intl" name="og:title" />
      <meta
        content="A minimal, but complete solution for internationalization in Next.js apps."
        name="og:description"
      />
      <meta content="summary_large_image" name="twitter:card" />
      <meta content="jamannnnnn" name="twitter:site" />
      <meta
        content="https://next-intl-docs.vercel.app/logo.svg"
        name="twitter:image"
      />
      <meta content="React Hooks for Data Fetching – SWR" name="og:title" />
      <meta
        content="https://next-intl-docs.vercel.app/logo.svg"
        name="og:image"
      />
      <meta
        content="A minimal, but complete solution for internationalization in Next.js apps."
        name="description"
      />
    </>
  )
};
