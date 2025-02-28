/**
 * This is the main entry file when 'react-server' environments
 * (i.e. RSC) import from 'next-intl'. Currently we export everything
 * from `use-intl` core, but React-APIs are stubbed out.
 *
 * Make sure this mirrors the API from '../react-client'.
 */

// Replaced exports from the `react` package
export {default as useLocale} from './useLocale.js';
export {default as useTranslations} from './useTranslations.js';
export {default as useFormatter} from './useFormatter.js';
export {default as useNow} from './useNow.js';
export {default as useTimeZone} from './useTimeZone.js';
export {default as useMessages} from './useMessages.js';
export {default as NextIntlClientProvider} from './NextIntlClientProviderServer.js';

// Everything from `core`
export * from 'use-intl/core';
