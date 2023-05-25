function notSupported(name: string) {
  throw new Error(`\`${name}\` is not supported in Client Components.`);
}

export const getRequestConfig = notSupported('getRequestConfig');
export const getIntl = notSupported('getIntl');
export const getFormatter = notSupported('getFormatter');
export const getLocale = notSupported('getLocale');
export const getNow = notSupported('getNow');
export const getTimeZone = notSupported('getTimeZone');
export const getTranslations = notSupported('getTranslations');

// TODO: Since this is available in Client Comonents too, we should really
// consider exporting this from `next-intl/navigation` instead. For now, for
// compatibility, we'll add a client entry point for `next-intl/server`.
export {default as redirect} from './redirect';
