/**
 * This is the main entry file when non-'react-server'
 * environments import from 'next-intl'.
 *
 * Maintainer notes:
 * - Make sure this mirrors the API from 'react-server'.
 * - Make sure everything exported from this module is
 *   supported in all Next.js versions that are supported.
 */

export * from 'use-intl';

// Replace `useLocale` export from `use-intl`
export {default as useLocale} from './useLocale';

export {default as NextIntlClientProvider} from '../shared/NextIntlClientProvider';
