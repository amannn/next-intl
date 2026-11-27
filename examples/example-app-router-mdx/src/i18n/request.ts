import {hasLocale} from 'next-intl';
import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';
import {defaultLocale, locales} from './config';

export default getRequestConfig(async () => {
  const store = await cookies();
  const requestedLocale = store.get('locale')?.value;
  const locale = hasLocale(locales, requestedLocale)
    ? requestedLocale
    : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
