/**
 * Server-only APIs available via `next-intl/server`.
 */

export {
  default as getRequestConfig,
  type GetRequestConfigParams,
  type RequestConfig
} from './getRequestConfig';
export {default as getFormatter} from './getFormatter';
export {default as getNow} from './getNow';
export {default as getTimeZone} from './getTimeZone';
export {default as getTranslations} from './getTranslations';
export {default as getMessages} from './getMessages';
export {default as getLocale} from './getLocale';

export {setCachedRequestLocale as setRequestLocale} from './RequestLocaleCache';

export {
  /** @deprecated Deprecated in favor of `setRequestLocale`. */
  setCachedRequestLocale as unstable_setRequestLocale
} from './RequestLocaleCache';
