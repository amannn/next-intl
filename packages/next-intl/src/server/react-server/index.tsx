/**
 * Server-only APIs available via `next-intl/server`.
 */

export {
  setRequestLocale as unstable_setRequestLocale,
  getRequestConfig,
  getFormatter,
  getNow,
  getTimeZone,
  getTranslations,
  getMessages,
  getLocale
} from '../../runtimes/react-server.shared-runtime';
