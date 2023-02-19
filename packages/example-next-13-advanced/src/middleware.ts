import createIntlMiddleware from 'next-intl/middleware';

export default createIntlMiddleware({
  locales: ['en', 'de'],
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
  // Skip all non-content paths
  matcher: ['/((?!api|_next|assets|favicon.ico).*)']
};
