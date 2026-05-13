import {hasLocale} from 'next-intl';
import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async ({locale, requestLocale}) => {
  let resolvedLocale = locale;

  if (!resolvedLocale) {
    const requested = await requestLocale;
    resolvedLocale = hasLocale(routing.locales, requested)
      ? requested
      : routing.defaultLocale;
  }

  return {
    locale: resolvedLocale,
    messages: (await import(`../../messages/${resolvedLocale}.json`)).default
  };
});
