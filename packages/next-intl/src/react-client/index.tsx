/**
 * This is the main entry file when non-'react-server'
 * environments import from 'next-intl'.
 *
 * Make sure this mirrors the API from 'react-server'.
 */

import Link from './Link';

export * from 'use-intl';
export {default as Link} from './Link';
export {default as NextIntlClientProvider} from '../shared/NextIntlClientProvider';

// Legacy export (TBD if we'll deprecate this in favour of `NextIntlClientProvider`)
export {default as NextIntlProvider} from '../shared/NextIntlClientProvider';

/** @deprecated Is called `Link` now. */
export const LocalizedLink = Link;

export {default as useLocalizedRouter} from './useLocalizedRouter';
