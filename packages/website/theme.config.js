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
      src="https://raw.githubusercontent.com/amannn/next-intl/main/media/logo.svg"
      style={{height: 62}}
    />
  ),
  head:({title})=>
  console.log(title)||
  (
    <>
    <title>next-intl</title>
      <link href="/favicon.png" rel="shortcut icon" type="image/x-icon" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="og:title" content="next-intl" />
      <meta name="description" content="A minimal, but complete solution for managing translations, date, time and number formatting in Next.js apps." />
    </>
  )
};
