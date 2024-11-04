import {createLocalizedPathnamesNavigation} from 'next-intl/navigation';

export const {
  Link,
  getPathname,
  permanentRedirect,
  redirect,
  usePathname,
  useRouter
} = createLocalizedPathnamesNavigation({
  locales: ['en', 'de'],
  defaultLocale: 'en',
  pathnames: {
    '/': {
      en: '/',
      de: '/de/'
    },
    '/about': {
      en: '/about',
      de: '/ueber'
    }
  }
});
