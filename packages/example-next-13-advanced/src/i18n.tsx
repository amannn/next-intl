import {IntlError, NextI18nConfig} from 'next-intl';

const config: NextI18nConfig = {
  locales: ['en', 'de'],
  defaultLocale: 'en',

  async getOptions({locale}) {
    return {
      defaultTranslationValues: {
        globalString: 'Global string',
        highlight: (chunks) => <strong>{chunks}</strong>
      },
      messages: (await import(`../messages/${locale}.json`)).default,
      formats: {
        dateTime: {
          medium: {
            dateStyle: 'medium',
            timeStyle: 'short',
            hour12: false
          }
        }
      },
      onError(error: IntlError) {
        if (
          error.message ===
          'MISSING_MESSAGE: Could not resolve `missing` in `Index`.'
        ) {
          // Do nothing, this error is triggered on purpose
        } else {
          console.error(JSON.stringify(error.message));
        }
      },
      getMessageFallback({key, namespace}: {namespace?: string; key: string}) {
        return (
          '`getMessageFalback` called for ' +
          [namespace, key].filter((part) => part != null).join('.')
        );
      }
    };
  }
};

export default config;
