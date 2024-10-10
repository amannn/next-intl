import {NextResponse} from 'next/server';

type ResponseCookieOptions = Pick<
  NonNullable<Parameters<typeof NextResponse.prototype.cookies.set>['2']>,
  | 'maxAge'
  | 'domain'
  | 'expires'
  | 'partitioned'
  | 'path'
  | 'priority'
  | 'sameSite'
  | 'secure'
  // Not:
  // - 'httpOnly' (the client side needs to read the cookie)
  // - 'name' (the client side needs to know this as well)
  // - 'value' (only the middleware knows this)
>;

export type MiddlewareOptions = {
  /**
   * Sets the `Link` response header to notify search engines about content in other languages (defaults to `true`). See https://developers.google.com/search/docs/specialty/international/localized-versions#http
   * @see https://next-intl-docs.vercel.app/docs/routing/middleware#alternate-links
   **/
  alternateLinks?: boolean;

  // http://localhost:3000/docs/routing/middleware#locale-cookie

  /**
   * Can be used to disable the locale cookie or to customize it.
   * @see https://next-intl-docs.vercel.app/docs/routing/middleware#locale-cookie
   */
  localeCookie?: boolean | ResponseCookieOptions;

  /**
   * By setting this to `false`, the cookie as well as the `accept-language` header will no longer be used for locale detection.
   * @see https://next-intl-docs.vercel.app/docs/routing/middleware#locale-detection
   **/
  localeDetection?: boolean;
};

export type ResolvedMiddlewareOptions = Required<MiddlewareOptions>;
