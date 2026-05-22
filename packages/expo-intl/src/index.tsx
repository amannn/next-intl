/**
 * Runtime entry for `expo-intl`. Mirrors `next-intl`'s react-client surface
 * (https://github.com/amannn/next-intl/blob/main/packages/next-intl/src/react-client/index.tsx),
 * minus the Next.js-specific provider — Expo Router renders all code as
 * client components, so `IntlProvider` from `use-intl/react` is sufficient.
 */

export * from 'use-intl/core';
export {
  IntlProvider,
  useFormatter,
  useLocale,
  useMessages,
  useNow,
  useTimeZone,
  useTranslations
} from 'use-intl/react';
export {_useExtracted as useExtracted} from 'use-intl/react';
