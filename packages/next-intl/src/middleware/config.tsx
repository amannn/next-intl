export type MiddlewareOptions = {
  /** Sets the `Link` response header to notify search engines about content in other languages (defaults to `true`). See https://developers.google.com/search/docs/specialty/international/localized-versions#http */
  alternateLinks?: boolean;

  /** By setting this to `false`, the cookie as well as the `accept-language` header will no longer be used for locale detection. */
  localeDetection?: boolean;
};

export type ResolvedMiddlewareOptions = Required<MiddlewareOptions>;
