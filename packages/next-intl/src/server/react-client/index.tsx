import type {
  getRequestConfig as getRequestConfig_type,
  getFormatter as getFormatter_type,
  getNow as getNow_type,
  getTimeZone as getTimeZone_type,
  getTranslator as getTranslator_type,
  getTranslations as getTranslations_type,
  getMessages as getMessages_type,
  unstable_setRequestLocale as unstable_setRequestLocale_type
} from '..';

function notSupported(name: string) {
  return () => {
    throw new Error(
      process.env.NODE_ENV !== 'production'
        ? `\`${name}\` is not supported in Client Components.`
        : undefined
    );
  };
}

// Must match `../index.tsx`

// prettier-ignore
export const getRequestConfig = (() => notSupported('getRequestConfig')) as unknown as typeof getRequestConfig_type;
// prettier-ignore
export const getFormatter = notSupported('getFormatter') as unknown as typeof getFormatter_type;
// prettier-ignore
export const getNow = notSupported('getNow') as unknown as typeof getNow_type;
// prettier-ignore
export const getTimeZone = notSupported('getTimeZone') as unknown as typeof getTimeZone_type;
// prettier-ignore
/** @deprecated Deprecated in favor of `getTranslations`. See https://github.com/amannn/next-intl/pull/600 */
export const getTranslator = notSupported('getTranslator') as unknown as typeof getTranslator_type;
// prettier-ignore
export const getTranslations = notSupported('getTranslations') as unknown as typeof getTranslations_type;
// prettier-ignore
export const getMessages = notSupported('getMessages') as unknown as typeof getMessages_type;
// prettier-ignore
export const getLocale = notSupported('getLocale') as unknown as typeof getMessages_type;
// prettier-ignore
export const unstable_setRequestLocale = notSupported('unstable_setRequestLocale') as unknown as typeof unstable_setRequestLocale_type;
