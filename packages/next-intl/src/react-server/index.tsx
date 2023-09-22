/**
 * This is the main entry file when 'react-server' environments
 * (i.e. RSC) import from 'next-intl'. Currently we export everything
 * from `use-intl` core, but React-APIs are stubbed out.
 *
 * Make sure this mirrors the API from '../react-client'.
 */

// Replaced exports from the `react` package
export {default as useLocale} from './useLocale';
export {default as useTranslations} from './useTranslations';
export {default as useFormatter} from './useFormatter';
export {default as useNow} from './useNow';
export {default as useTimeZone} from './useTimeZone';
export {default as useMessages} from './useMessages';
export {default as NextIntlClientProvider} from './NextIntlClientProvider';

// Everything from `core`
export * from 'use-intl/core';
