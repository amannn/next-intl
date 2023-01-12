import useLocale from './react-client/useLocale';
import createLocalizedLinkComponent from './shared/createLocalizedLinkComponent';

/**
 * This is the main entry file when non-'react-server' environments import
 * from 'next-intl'. Make sure this mirrors the API from 'react-server'.
 */

// Everything except for `useLocale`, as we provide an optimized implementation for that
export {
  AbstractIntlMessages,
  TranslationValues,
  RichTranslationValues,
  Formats,
  DateTimeFormatOptions,
  NumberFormatOptions,
  IntlError,
  IntlErrorCode,
  createTranslator,
  createIntl,
  useTranslations,
  useIntl,
  useNow,
  useTimeZone
} from 'use-intl';

export {default as useLocale} from './react-client/useLocale';

export const LocalizedLink = createLocalizedLinkComponent(useLocale);
export {default as NextIntlConfig} from './server/NextIntlConfig';

// Legacy export for compatibility
export {NextIntlClientProvider as NextIntlProvider} from './client';
