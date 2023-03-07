import createIntlMiddleware from 'next-intl/middleware';

export default createIntlMiddleware({
  locales: ['en', 'de', 'es', 'fr'],
  defaultLocale: 'en',
  domains: [
    {
      domain: 'example.fr',
      defaultLocale: 'fr'
    }
  ]
});

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!_next|assets|favicon.ico).*)']
};
