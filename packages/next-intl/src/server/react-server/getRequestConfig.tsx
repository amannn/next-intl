import type {IntlConfig, Locale} from 'use-intl/core';

export type RequestConfig = Omit<IntlConfig, 'locale' | 'timeZone'> & {
  /**
   * @see https://next-intl.dev/docs/usage/configuration#i18n-request
   **/
  locale: IntlConfig['locale'];
  timeZone?:
    | IntlConfig['timeZone']
    | (() => NonNullable<IntlConfig['timeZone']>);
};

export type GetRequestConfigParams = {
  /**
   * If you provide an explicit locale to an async server-side function like
   * `getTranslations({locale: 'en'})`, it will be passed via `locale` to
   * `getRequestConfig` so you can use it instead of the segment value.
   */
  locale?: Locale;

  /**
   * Typically corresponds to the `[locale]` segment that was matched by the middleware.
   *
   * However, there are three special cases to consider:
   * 1. **Overrides**: When an explicit `locale` is passed to awaitable functions
   *    like `getTranslations({locale: 'en'})`, then this value will be used
   *    instead of the segment.
   * 2. **`undefined`**: The value can be `undefined` when a page outside of the
   *    `[locale]` segment renders (e.g. a language selection page at `app/page.tsx`).
   * 3. **Invalid values**: Since the `[locale]` segment effectively acts like a
   *    catch-all for unknown routes (e.g. `/unknown.txt`), invalid values should
   *    be replaced with a valid locale.
   *
   * @see https://next-intl.dev/docs/usage/configuration#i18n-request
   */
  requestLocale: Promise<string | undefined>;
};

/**
 * Should be called in `i18n/request.ts` to create the configuration for the current request.
 */
export default function getRequestConfig(
  createRequestConfig: (
    params: GetRequestConfigParams
  ) => RequestConfig | Promise<RequestConfig>
) {
  return createRequestConfig;
}
