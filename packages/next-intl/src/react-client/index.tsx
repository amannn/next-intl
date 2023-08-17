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

export * from 'use-intl/core';

// Everything except for `useLocale`, which is replaced by an alternative
export {
  IntlProvider,
  useTranslations,
  useNow,
  useTimeZone,
  useMessages,
  useFormatter,
  useIntl
} from 'use-intl/react';
export {default as useLocale} from './useLocale';

export {default as NextIntlClientProvider} from '../shared/NextIntlClientProvider';

// Legacy export (TBD if we'll deprecate this in favour of `NextIntlClientProvider`)
export {default as NextIntlProvider} from '../shared/NextIntlClientProvider';

/** @deprecated Is available as `import Link from 'next-intl/link'` now. */
export const LocalizedLink = Link; // TODO: Remove, this is only for compatibility in the RSC beta and would break Next.js 12
/** @deprecated Is available as `import Link from 'next-intl/link'` now. */
export {default as Link} from './Link'; // TODO: Remove, this is only for compatibility in the RSC beta and would break Next.js 12

export {default as useLocalizedRouter} from './useLocalizedRouter';
