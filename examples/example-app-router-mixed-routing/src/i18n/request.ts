import {hasLocale} from 'next-intl';
import {getRequestConfig} from 'next-intl/server';
import {COOKIE_NAME, defaultLocale, locales} from '../config';
import {cookies} from 'next/headers';

export default getRequestConfig(async ({requestLocale}) => {
  // Read from potential `[locale]` segment
  // if the user is on a public page
  let candidate = await requestLocale;

  if (!candidate) {
    // Read from cookie if the user is logged in
    const store = await cookies();
    candidate = store.get(COOKIE_NAME)?.value;
  }

  const locale = hasLocale(locales, candidate) ? candidate : defaultLocale;
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
