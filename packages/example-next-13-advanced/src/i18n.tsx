import {NextIntlRuntimeConfigParams, NextIntlRuntimeConfig} from 'next-intl';

export default {
  locales: ['en', 'de'],
  defaultLocale: 'en'
};

export async function getRuntimeConfig(
  params: NextIntlRuntimeConfigParams
): Promise<NextIntlRuntimeConfig> {
  const now = require('next/headers').headers().get('x-now');
  const timeZone = require('next/headers').headers().get('x-time-zone');
  const messages = (await import(`../messages/${params.locale}.json`)).default;

  return {
    now: now ? new Date(now) : undefined,
    timeZone,
    messages,
    defaultTranslationValues: {
      globalString: 'Global string',
      highlight: (chunks) => <strong>{chunks}</strong>
    },
    formats: {
      dateTime: {
        medium: {
          dateStyle: 'medium',
          timeStyle: 'short',
          hour12: false
        }
      }
    },
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
        '`getMessageFalback` called for ' +
        [namespace, key].filter((part) => part != null).join('.')
      );
    }
  };
}
