/**
 * Server-only APIs.
 */

/** @deprecated */
export function createIntlMiddleware() {
  throw new Error(
    "DEPRECATION ERROR: `import {createIntlMiddleware} from 'next-intl';` is deprecated and needs to be replaced with `import createIntlMiddleware from 'next-intl/middleware'`."
  );
}

export {default as getRequestConfig} from './getRequestConfig';
export {default as getIntl} from './getIntl';
export {default as getLocale} from './getLocale';
export {default as getNow} from './getNow';
export {default as getTimeZone} from './getTimeZone';
export {default as getTranslations} from './getTranslations';

export {default as redirect} from './redirect';
