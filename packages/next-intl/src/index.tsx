/**
 * This is the main entry file when non-'react-server' environments import
 * from 'next-intl'. Make sure this mirrors the API from 'react-server'.
 */

import Link from './shared/Link';

export * from 'use-intl';

export {default as useLocalizedRouter} from './react-client/useLocalizedRouter';
export {default as Link} from './shared/Link';

/** @deprecated Is called `Link` now. */
export const LocalizedLink = Link;

export {default as NextIntlClientProvider} from './shared/NextIntlClientProvider';

// Legacy export for compatibility
export {default as NextIntlProvider} from './shared/NextIntlClientProvider';
