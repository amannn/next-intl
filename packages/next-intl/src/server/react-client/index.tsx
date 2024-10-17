import type {
  getFormatter as getFormatter_type,
  getLocale as getLocale_type,
  getMessages as getMessages_type,
  getNow as getNow_type,
  getRequestConfig as getRequestConfig_type,
  getTimeZone as getTimeZone_type,
  unstable_setRequestLocale as unstable_setRequestLocale_type
} from '../react-server';

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

export function getRequestConfig(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ...args: Parameters<typeof getRequestConfig_type>
): ReturnType<typeof getRequestConfig_type> {
  return notSupported('getRequestConfig');
}
export const getFormatter = notSupported(
  'getFormatter'
) as typeof getFormatter_type;
export const getNow = notSupported('getNow') as typeof getNow_type;
export const getTimeZone = notSupported(
  'getTimeZone'
) as typeof getTimeZone_type;
export const getMessages = notSupported(
  'getMessages'
) as typeof getMessages_type;
export const getLocale = notSupported('getLocale') as typeof getLocale_type;

// The type of `getTranslations` is not assigned here because it
// causes a type error. The types use the `react-server` entry
// anyway, therefore this is irrelevant.
export const getTranslations = notSupported('getTranslations');

export const unstable_setRequestLocale = notSupported(
  'unstable_setRequestLocale'
) as typeof unstable_setRequestLocale_type;
