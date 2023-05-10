/**
 * This is the main entry file when non-'react-server'
 * environments import from 'next-intl'.
 *
 * Make sure this mirrors the API from 'react-server'.
 */

export * from 'use-intl';
export {default as Link} from './Link';
export {default as NextIntlClientProvider} from '../shared/NextIntlClientProvider';

// Legacy export (TBD if we'll deprecate this in favour of `NextIntlClientProvider`)
export {default as NextIntlProvider} from '../shared/NextIntlClientProvider';
