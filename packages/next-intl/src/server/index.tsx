import createMiddleware_ from '../middleware';

let hasWarned = false;
/** @deprecated Should be imported as `import createMiddleware from 'next-intl/middleware', not from `next-intl/server`. */
export function createIntlMiddleware(
  ...args: Parameters<typeof createMiddleware_>
) {
  if (!hasWarned) {
    hasWarned = true;
    console.warn(
      'Importing `createMiddleware` from `next-intl/server` is deprecated. ' +
        "Please import it as `import createMiddleware from 'next-intl/middleware'`."
    );
  }
  return createMiddleware_(...args);
}
