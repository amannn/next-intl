import {hasLocale} from 'next-intl';
import {getRequestConfig} from 'next-intl/server';
import messages from '../../messages/en.json';
import {unstable_rootParams as rootParams} from 'next/server';
import {routing} from './routing';

export default getRequestConfig(async () => {
  const params = await rootParams();
  const locale = hasLocale(routing.locales, params.locale)
    ? params.locale
    : routing.defaultLocale;

  return {
    locale,
    messages
  };
});

// Use case for overriding locale:
// export default getRequestConfig(async (args) => {
//   const params = await rootParams();
//
//   let locale = args.locale;
//   if (!locale) {
//     locale = hasLocale(routing.locales, params.locale)
//       ? params.locale
//       : routing.defaultLocale;
//   }
//
//   return {
//     locale,
//     messages
//   };
// });
