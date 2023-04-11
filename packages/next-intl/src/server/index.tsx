import createMiddleware_ from '../middleware';

let hasWarned = false;
/** @deprecated Should be imported from `next-intl/middleware`, not `next-intl/server`. */
export function createMiddleware(
  ...args: Parameters<typeof createMiddleware_>
) {
  if (!hasWarned) {
    hasWarned = true;
    console.warn(
      'DEPRECATION WARNING: Importing `createMiddleware` from `next-intl/server` is deprecated. ' +
        'Please import it from `next-intl/middleware` instead.'
    );
  }
  return createMiddleware_(...args);
}
