import {headers} from 'next/headers';
import {Formats} from 'next-intl';
import {getRequestConfig} from 'next-intl/server';
import defaultMessages from '../../messages/en.json';
import {routing} from './routing';

export const formats = {
  dateTime: {
    medium: {
      dateStyle: 'medium',
      timeStyle: 'short',
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

export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that the incoming locale is valid
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  const now = (await headers()).get('x-now');
  const timeZone = (await headers()).get('x-time-zone') ?? 'Europe/Vienna';
  const localeMessages = (await import(`../../messages/${locale}.json`))
    .default;
  const messages = {...defaultMessages, ...localeMessages};

  return {
    locale,
    now: now ? new Date(now) : undefined,
    timeZone,
    messages,
    formats,
    onError(error) {
      if (
        error.message ===
        (process.env.NODE_ENV === 'production'
          ? 'MISSING_MESSAGE'
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
