import createIntlMiddleware from 'next-intl/middleware';

export default createIntlMiddleware({
  locales: ['en', 'de', 'es'],
  defaultLocale: 'en',
  domains: [
    {
      domain: 'example.de',
      defaultLocale: 'de'
    },
    {
      domain: 'de.example.com',
      defaultLocale: 'de'
    }
  ]
});

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!_next|assets|favicon.ico).*)']
};
