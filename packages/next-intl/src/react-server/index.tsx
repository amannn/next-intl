/**
 * This is the main entry file when 'react-server' environments
 * (i.e. RSC) import from 'next-intl'. Currently we export everything
 * from `use-intl` core, but React-APIs are stubbed out.
 *
 * Make sure this mirrors the API from '../react-client'.
 */

// Replaced exports from the `react` package
export {default as useLocale} from './useLocale.tsx';
export {default as useTranslations} from './useTranslations.tsx';
export {default as useFormatter} from './useFormatter.tsx';
export {default as useNow} from './useNow.tsx';
export {default as useTimeZone} from './useTimeZone.tsx';
export {default as useMessages} from './useMessages.tsx';
export {default as NextIntlClientProvider} from './NextIntlClientProviderServer.tsx';

// Everything from `core`
export * from 'use-intl/core';
