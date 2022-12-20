import {useLocale} from 'use-intl';
import createLocalizedLinkComponent from './shared/createLocalizedLinkComponent';

/**
 * Main entry that contains all APIs that are available
 * on both the server as well as the client.
 */

export * from 'use-intl';

export const LocalizedLink = createLocalizedLinkComponent(useLocale);
export {default as NextIntlConfig} from './server/NextIntlConfig';

// Legacy export for compatibility
export {NextIntlClientProvider as NextIntlProvider} from './client';
