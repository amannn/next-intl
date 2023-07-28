import {createNamedNavigation} from 'next-intl/navigation';
import {locales, pathnames} from './i18n';

export const {Link, redirect, usePathname, useRouter} = createNamedNavigation({
  locales,
  pathnames
});

// export const {Link, redirect, useRouter} = createDefaultNavigation({
//   locales,
//   pathnames
// });

// this has some advantages:
// - no type overloading for redirect and router push
// - strong types for the locale and default locale
// - usePathname

// can these apis be used in both server and client files?
// maybe we need to fork createNamedRouting into a react-server version
// that could work, because we have to separate bundles
