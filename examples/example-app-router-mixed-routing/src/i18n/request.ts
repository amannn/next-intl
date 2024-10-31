import {isValidLocale} from 'next-intl';
import {getRequestConfig} from 'next-intl/server';
import {defaultLocale, locales} from '../config';
import {getUserLocale} from '../db';

export default getRequestConfig(async ({requestLocale}) => {
  // Read from potential `[locale]` segment
  let candidate = await requestLocale;

  if (!candidate) {
    // The user is logged in
    candidate = await getUserLocale();
  }
  const locale = isValidLocale(locales, candidate) ? candidate : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
