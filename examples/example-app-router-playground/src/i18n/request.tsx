import * as rootParams from 'next/root-params';
import {headers} from 'next/headers';
import {Formats, hasLocale, IntlErrorCode} from 'next-intl';
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';
import defaultMessages from '../../messages/en.json';
import {routing} from './routing';

export const formats = {
  dateTime: {
    medium: {
      dateStyle: 'medium',
      timeStyle: 'short',
      hour12: false
    },
    long: {
      dateStyle: 'full',
      timeStyle: 'long',
      hour12: false
    }
  },
  number: {
    precise: {
      maximumFractionDigits: 5
    }
  },
  list: {
    enumeration: {
      style: 'long',
      type: 'conjunction'
    }
  }
} satisfies Formats;

export default getRequestConfig(async ({locale, requestLocale}) => {
  let resolvedLocale = locale;

  if (!resolvedLocale) {
    const paramValue = await rootParams.locale();
    if (hasLocale(routing.locales, paramValue)) {
      resolvedLocale = paramValue;
    } else if (paramValue != null) {
      notFound();
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

  const now = (await headers()).get('x-now');
  const timeZone = (await headers()).get('x-time-zone') ?? 'Europe/Vienna';
  const localeMessages = (await import(`../../messages/${resolvedLocale}.json`))
    .default;
  const messages = {...defaultMessages, ...localeMessages};

  return {
    locale: resolvedLocale,
    now: now
      ? new Date(now)
      : // Ensure a consistent value for a render
        new Date(),
    timeZone,
    messages,
    formats,
    onError(error) {
      if (
        error.message ===
        (process.env.NODE_ENV === 'production'
          ? IntlErrorCode.MISSING_MESSAGE
          : 'MISSING_MESSAGE: Could not resolve `missing` in `Index`.')
      ) {
        // Do nothing, this error is triggered on purpose
      } else {
        console.error(JSON.stringify(error.message));
      }
    },
    getMessageFallback({key, namespace}) {
      return (
        '`getMessageFallback` called for ' +
        [namespace, key].filter((part) => part != null).join('.')
      );
    }
  };
});
