/**
 * This is the main entry file when 'react-server' environments
 * (i.e. RSC) import from 'next-intl'. Currently we export everything
 * from `use-intl` core, but React-APIs are stubbed out.
 *
 * Make sure this mirrors the API from '../react-client'.
 */

export * from 'use-intl/dist/src/core';
export {default as NextIntlClientProvider} from '../shared/NextIntlClientProvider';

function notSupported() {
  throw new Error(
    `The React APIs of next-intl are currently not available in Server Components.

You can try one of these options:
1. Try out the Server Components beta, see https://next-intl-docs.vercel.app/docs/getting-started
2. Use the core library as a stopgap solution, see https://next-intl-docs.vercel.app/docs/environments/core-library
`
  );
}

export const IntlProvider = notSupported;
export const useTranslations = notSupported;
export const useIntl = notSupported;
export const useLocale = notSupported;
export const useNow = notSupported;
export const useTimeZone = notSupported;
export const Link = notSupported;
