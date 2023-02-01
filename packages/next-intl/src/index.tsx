/**
 * This is the main entry file when non-'react-server' environments import
 * from 'next-intl'. Make sure this mirrors the API from 'react-server'.
 */

export * from 'use-intl';

export {default as useLocalizedRouter} from './react-client/useLocalizedRouter';
export {default as LocalizedLink} from './react-client/LocalizedLink';
export * from './server/NextIntlConfig';
export {default as NextIntlConfig} from './server/NextIntlConfig';

// Legacy export for compatibility
export {NextIntlClientProvider as NextIntlProvider} from './client';
