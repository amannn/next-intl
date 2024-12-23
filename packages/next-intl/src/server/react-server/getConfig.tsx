import {cache} from 'react';
import {
  type IntlConfig,
  type Locale,
  _createCache,
  _createIntlFormatters,
  initializeConfig
} from 'use-intl/core';
import {getRequestLocale} from './RequestLocale.tsx';
import createRequestConfig from './createRequestConfig.tsx';
import type {GetRequestConfigParams} from './getRequestConfig.tsx';

// This is automatically inherited by `NextIntlClientProvider` if
// the component is rendered from a Server Component
function getDefaultTimeZoneImpl() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
const getDefaultTimeZone = cache(getDefaultTimeZoneImpl);

async function receiveRuntimeConfigImpl(
  getConfig: typeof createRequestConfig,
  localeOverride?: Locale
) {
  if (
    process.env.NODE_ENV !== 'production' &&
    typeof getConfig !== 'function'
  ) {
    throw new Error(
      `Invalid i18n request configuration detected.

Please verify that:
1. In case you've specified a custom location in your Next.js config, make sure that the path is correct.
2. You have a default export in your i18n request configuration file.

See also: https://next-intl.dev/docs/usage/configuration#i18n-request
`
    );
  }

  const params: GetRequestConfigParams = {
    locale: localeOverride,

    // In case the consumer doesn't read `params.locale` and instead provides the
    // `locale` (either in a single-language workflow or because the locale is
    // read from the user settings), don't attempt to read the request locale.
    get requestLocale() {
      return localeOverride
        ? Promise.resolve(localeOverride)
        : getRequestLocale();
    }
  };

  let result = getConfig(params);
  if (result instanceof Promise) {
    result = await result;
  }

  if (!result.locale) {
    throw new Error(
      'No locale was returned from `getRequestConfig`.\n\nSee https://next-intl.dev/docs/usage/configuration#i18n-request'
    );
  }

  return result;
}
const receiveRuntimeConfig = cache(receiveRuntimeConfigImpl);

const getFormatters = cache(_createIntlFormatters);
const getCache = cache(_createCache);

async function getConfigImpl(localeOverride?: Locale): Promise<
  IntlConfig & {
    getMessageFallback: NonNullable<IntlConfig['getMessageFallback']>;
    onError: NonNullable<IntlConfig['onError']>;
    timeZone: NonNullable<IntlConfig['timeZone']>;
    _formatters: ReturnType<typeof _createIntlFormatters>;
  }
> {
  const runtimeConfig = await receiveRuntimeConfig(
    createRequestConfig,
    localeOverride
  );
  return {
    ...initializeConfig(runtimeConfig),
    _formatters: getFormatters(getCache()),
    timeZone: runtimeConfig.timeZone || getDefaultTimeZone()
  };
}
const getConfig = cache(getConfigImpl);
export default getConfig;
