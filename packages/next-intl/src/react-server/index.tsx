/**
 * This is the main entry file when the 'react-server' environment imports
 * from 'next-intl'. Make sure this mirrors the API from the main entry.
 */

// Replaced exports from the `react` package
export {default as useLocale} from './useLocale';
export {default as useTranslations} from './useTranslations';
export {default as useIntl} from './useIntl';
export {default as useNow} from './useNow';
export {default as useTimeZone} from './useTimeZone';
export {default as LocalizedLink} from './LocalizedLink';

// Everything from `core`
export * from 'use-intl/dist/src/core';
