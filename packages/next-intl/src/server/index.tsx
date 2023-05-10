/**
 * Server-only APIs available via `next-intl/server`.
 */

import createMiddleware_ from '../middleware';
import MiddlewareConfig from '../middleware/NextIntlMiddlewareConfig';

let hasWarned = false;
/** @deprecated Should be imported as `import createMiddleware from 'next-intl/middleware', not from `next-intl/server`. */
export function createIntlMiddleware(config: MiddlewareConfig) {
  if (!hasWarned) {
    hasWarned = true;
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
