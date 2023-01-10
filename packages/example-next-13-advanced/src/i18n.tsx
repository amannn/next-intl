import {IntlError, NextIntlConfig} from 'next-intl';

const i18n: NextIntlConfig = {
  locales: ['en', 'de'],
  defaultLocale: 'en',
  async getMessages({locale}) {
    return (await import(`../messages/${locale}.json`)).default;
  },
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
  onError(error: IntlError) {
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
  getMessageFallback({key, namespace}: {namespace?: string; key: string}) {
    return (
      '`getMessageFalback` called for ' +
      [namespace, key].filter((part) => part != null).join('.')
    );
  }
};

export default i18n;
