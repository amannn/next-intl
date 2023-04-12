/**
 * Server-only APIs.
 */

/** @deprecated */
export function createIntlMiddleware() {
  throw new Error(
    `
    Importing \`createMiddleware\` from \`next-intl/server\` is deprecated and no longer supported. Please update the import and add a \`matcher\`:
    
      // middleware.ts
      import createMiddleware from 'next-intl/middleware';
    
      // ...
    
      export const config = {
        // Skip all paths that should not be internationalized
        matcher: ['/((?!api|_next|.*\\\\..*).*)']
      };
    `
  );
}

export {default as getRequestConfig} from './getRequestConfig';
export {default as getIntl} from './getIntl';
export {default as getFormatter} from './getFormatter';
export {default as getLocale} from './getLocale';
export {default as getNow} from './getNow';
export {default as getTimeZone} from './getTimeZone';
export {default as getTranslations} from './getTranslations';

export {default as redirect} from './redirect';
