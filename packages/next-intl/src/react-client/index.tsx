/**
 * This is the main entry file when non-'react-server'
 * environments import from 'next-intl'.
 *
 * Maintainer notes:
 * - Make sure this mirrors the API from 'react-server'.
 * - Make sure everything exported from this module is
 *   supported in all Next.js versions that are supported.
 */

import Link from './Link';

export * from 'use-intl';
export {default as NextIntlClientProvider} from '../shared/NextIntlClientProvider';

// Legacy export (TBD if we'll deprecate this in favour of `NextIntlClientProvider`)
export {default as NextIntlProvider} from '../shared/NextIntlClientProvider';

/** @deprecated Is available as `import Link from 'next-intl/link'` now. */
export const LocalizedLink = Link;
export {default as Link} from './Link';

export {default as useLocalizedRouter} from './useLocalizedRouter';
