/**
 * Allows to import `next-intl/server` in non-RSC environments.
 *
 * This is mostly relevant for testing, since e.g. a `generateMetadata`
 * export from a page might use `next-intl/server`, but the test
 * only uses the default export for a page.
 */

function notSupported(message: string) {
  return () => {
    throw new Error(`\`${message}\` is not supported in Client Components.`);
  };
}

export const getRequestConfig = notSupported('getRequestConfig');
export const getFormatter = notSupported('getFormatter');
export const getNow = notSupported('getNow');
export const getTimeZone = notSupported('getTimeZone');
export const getTranslations = notSupported('getTranslations');
export const getMessages = notSupported('getMessages');
export const getLocale = notSupported('getLocale');

export const unstable_setRequestLocale = notSupported(
  'unstable_setRequestLocale'
);
