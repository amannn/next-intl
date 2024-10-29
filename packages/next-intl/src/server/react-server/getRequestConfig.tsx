import type {IntlConfig} from 'use-intl/core';

export type RequestConfig = Omit<IntlConfig, 'locale'> & {
  /**
   * @see https://next-intl-docs.vercel.app/docs/usage/configuration#i18n-request
   **/
  locale?: IntlConfig['locale'];
};

export type GetRequestConfigParams = {
  /**
   * Deprecated in favor of `requestLocale` (see https://next-intl-docs.vercel.app/blog/next-intl-3-22#await-request-locale).
   *
   * The locale that was matched by the `[locale]` path segment. Note however
   * that this can be overridden in async APIs when the `locale` is explicitly
   * passed (e.g. `getTranslations({locale: 'en'})`).
   *
   * @deprecated
   */
  locale: string;

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
   * @see https://next-intl-docs.vercel.app/docs/usage/configuration#i18n-request
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
