import type {
  getRequestConfig as getRequestConfig_type,
  getIntl as getIntl_type,
  getFormatter as getFormatter_type,
  getLocale as getLocale_type,
  getNow as getNow_type,
  getTimeZone as getTimeZone_type,
  getTranslations as getTranslations_type,
  getTranslator as getTranslator_type,
  getMessages as getMessages_type
} from '..';

function notSupported(name: string) {
  throw new Error(`\`${name}\` is not supported in Client Components.`);
}

// Must match `../index.tsx`

// prettier-ignore
export const getRequestConfig = notSupported('getRequestConfig') as unknown as typeof getRequestConfig_type;
// prettier-ignore
export const getIntl = notSupported('getIntl') as unknown as typeof getIntl_type;
// prettier-ignore
export const getFormatter = notSupported('getFormatter') as unknown as typeof getFormatter_type;
// prettier-ignore
export const getLocale = notSupported('getLocale') as unknown as typeof getLocale_type;
// prettier-ignore
export const getNow = notSupported('getNow') as unknown as typeof getNow_type;
// prettier-ignore
export const getTimeZone = notSupported('getTimeZone') as unknown as typeof getTimeZone_type;
// prettier-ignore
export const getTranslations = notSupported('getTranslations') as unknown as typeof getTranslations_type;
// prettier-ignore
export const getTranslator = notSupported('getTranslator') as unknown as typeof getTranslator_type;
// prettier-ignore
export const getMessages = notSupported('getMessages') as unknown as typeof getMessages_type;

// TODO: Since this is available in Client Comonents too, we should really
// consider exporting this from `next-intl/navigation` instead. For now, for
// compatibility, we'll add a client entry point for `next-intl/server`.
export {default as redirect} from './redirect';
