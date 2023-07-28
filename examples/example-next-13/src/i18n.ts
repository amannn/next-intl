import {Pathnames} from 'next-intl/navigation';
import {getRequestConfig} from 'next-intl/server';

export const locales = ['en', 'de'] as const;

// is it good that export this here? do we need to worry about tree shaking to include server-only code?
// try in advanced example
export const pathnames: Pathnames<typeof locales> = {
  '/': '/',
  '/about': {
    en: '/about',
    de: '/ueber'
  }
} as const;

export default getRequestConfig(async ({locale}) => ({
  messages: (await import(`../messages/${locale}.json`)).default
}));
