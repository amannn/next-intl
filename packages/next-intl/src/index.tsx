/**
 * This is the main entry file when non-'react-server' environments import
 * from 'next-intl'. Make sure this mirrors the API from 'react-server'.
 */

export * from 'use-intl';

export {default as useLocalizedRouter} from './react-client/useLocalizedRouter';
export {default as LocalizedLink} from './shared/LocalizedLink';
export {default as NextIntlClientProvider} from './shared/NextIntlClientProvider';

// DEPRECATED: Legacy export for compatibility
export {default as NextIntlProvider} from './shared/NextIntlClientProvider';
