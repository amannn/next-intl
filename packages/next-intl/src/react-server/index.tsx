/**
 * This is the main entry file when the 'react-server' environment imports
 * from 'next-intl'. Make sure this mirrors the API from the main entry.
 */

import Link from './Link';

// Replaced exports from the `react` package
export {default as useLocale} from './useLocale';
export {default as useTranslations} from './useTranslations';
export {default as useIntl} from './useIntl';
export {default as useFormatter} from './useFormatter';
export {default as useNow} from './useNow';
export {default as useTimeZone} from './useTimeZone';
export {default as Link} from './Link';

export {default as NextIntlClientProvider} from '../shared/NextIntlClientProvider';

// Everything from `core`
export * from 'use-intl/dist/src/core';

/** @deprecated Is called `Link` now. */
export const LocalizedLink = Link;
