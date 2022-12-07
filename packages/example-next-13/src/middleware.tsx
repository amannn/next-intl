import {createIntlMiddleware} from 'next-intl/server';

export default createIntlMiddleware({
  locales: ['en', 'de'],
  defaultLocale: 'en'
});
