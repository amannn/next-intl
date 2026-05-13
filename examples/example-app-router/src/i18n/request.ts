import * as rootParams from 'next/root-params';
import {hasLocale} from 'next-intl';
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from './routing';

export default getRequestConfig(async ({locale, requestLocale}) => {
  let resolvedLocale = locale;

  if (!resolvedLocale) {
    const paramValue = await rootParams.locale();
    if (hasLocale(routing.locales, paramValue)) {
      resolvedLocale = paramValue;
    }
  }

  if (!resolvedLocale) {
    const requested = await requestLocale;
    if (hasLocale(routing.locales, requested)) {
      resolvedLocale = requested;
    }
  }

  if (!resolvedLocale) {
    notFound();
  }

  return {
    locale: resolvedLocale,
    messages: (await import(`../../messages/${resolvedLocale}.json`)).default
  };
});
