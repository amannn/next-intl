// Everything from core, React APIs stubbed-out for now (since they don't work without context)
export * from 'use-intl/dist/src/core';
export {default as NextIntlClientProvider} from '../shared/NextIntlClientProvider';

function notSupported() {
  throw new Error(
    'The React APIs of next-intl are currently not available in Server Components.' +
      '\n\n' +
      'You can either try out the Server Components beta (see https://next-intl-docs.vercel.app/docs/next-13/server-components) or use the core library as a stopgap solution (see https://next-intl-docs.vercel.app/docs/usage/core-library).'
  );
}

export const IntlProvider = notSupported;
export const useTranslations = notSupported;
export const useIntl = notSupported;
export const useLocale = notSupported;
export const useNow = notSupported;
export const useTimeZone = notSupported;
