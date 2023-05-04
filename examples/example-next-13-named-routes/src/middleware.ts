import createIntlMiddleware from 'next-intl/middleware';

export default createIntlMiddleware({
  locales: ['en', 'de'],
  defaultLocale: 'en',

  // TODO: Here a mapping needs to be created where the incoming request is
  // resolved to a named route and based on that, all localized routes are
  // linked to from the `Link` response header.
  alternateLinks: false
});

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!_next|assets|favicon.ico).*)']
};
