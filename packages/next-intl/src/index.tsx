/**
 * This is the main entry file when non-'react-server' environments import
 * from 'next-intl'. Make sure this mirrors the API from 'react-server'.
 */

import Link from './shared/Link';
import NextIntlClientProvider from './shared/NextIntlClientProvider';

export * from 'use-intl';

export {default as useLocalizedRouter} from './react-client/useLocalizedRouter';
export {default as Link} from './shared/Link';
export {default as NextIntlClientProvider} from './shared/NextIntlClientProvider';

/** @deprecated Is called `NextIntlClientProvider` now. */
export const NextIntlProvider = NextIntlClientProvider;

/** @deprecated Is called `Link` now. */
export const LocalizedLink = Link;
