import {createIntlMiddleware} from 'next-intl/server';

export default createIntlMiddleware({
  // By default the `timeZone` of the server
  // is used, but this can be overridden.
  timeZone: 'Europe/Vienna',

  // By default the current time of the server is used,
  // but you can override this (e.g. for test assertions).
  now: new Date('2020-01-01T00:00:00.000Z')
});

export const config = {
  // Skip all internal paths
  matcher: ['/((?!_next).*)']
};
