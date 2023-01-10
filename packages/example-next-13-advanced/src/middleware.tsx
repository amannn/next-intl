import {createIntlMiddleware} from 'next-intl/server';

export default createIntlMiddleware();

export const config = {
  // Skip all internal paths
  matcher: ['/((?!_next).*)']
};
