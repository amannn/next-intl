/**
 * Server-only APIs available via `next-intl/server`.
 */

import createMiddleware_ from '../middleware';
import MiddlewareConfig from '../middleware/NextIntlMiddlewareConfig';

let hasWarnedForMiddlewareImport = false;
/** @deprecated Should be imported as `import createMiddleware from 'next-intl/middleware', not from `next-intl/server`. */
export function createIntlMiddleware(config: MiddlewareConfig) {
  if (!hasWarnedForMiddlewareImport) {
    hasWarnedForMiddlewareImport = true;
    console.warn(
      `
Importing \`createMiddleware\` from \`next-intl/server\` is deprecated. Please update the import and add a \`matcher\`:

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
  return createMiddleware_({
    ...config,
    // @ts-expect-error
    _matcher: ['/((?!api|_next|.*\\..*).*)']
  });
}

// Must match `./react-client/index.tsx`
export {default as getRequestConfig} from './getRequestConfig';
export {default as getIntl} from './getIntl';
export {default as getFormatter} from './getFormatter';
export {default as getLocale} from './getLocale';
export {default as getNow} from './getNow';
export {default as getTimeZone} from './getTimeZone';
export {default as getTranslations} from './getTranslations';
export {default as getTranslator} from './getTranslator';
export {default as getMessages} from './getMessages';

export {default as redirect} from './redirect';
