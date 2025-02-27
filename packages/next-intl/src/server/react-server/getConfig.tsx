import {notFound} from 'next/navigation';
import {cache} from 'react';
import {
  IntlConfig,
  _createCache,
  _createIntlFormatters,
  initializeConfig
} from 'use-intl/core';
import {isPromise} from '../../shared/utils';
import {getRequestLocale} from './RequestLocale';
import {getRequestLocale as getRequestLocaleLegacy} from './RequestLocaleLegacy';
import createRequestConfig from './createRequestConfig';
import {GetRequestConfigParams} from './getRequestConfig';

let hasWarnedForMissingReturnedLocale = false;
let hasWarnedForAccessedLocaleParam = false;

// Make sure `now` is consistent across the request in case none was configured
function getDefaultNowImpl() {
  return new Date();
}
const getDefaultNow = cache(getDefaultNowImpl);

// This is automatically inherited by `NextIntlClientProvider` if
// the component is rendered from a Server Component
function getDefaultTimeZoneImpl() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
const getDefaultTimeZone = cache(getDefaultTimeZoneImpl);

async function receiveRuntimeConfigImpl(
  getConfig: typeof createRequestConfig,
  localeOverride?: string
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
    // In case the consumer doesn't read `params.locale` and instead provides the
    // `locale` (either in a single-language workflow or because the locale is
    // read from the user settings), don't attempt to read the request locale.
    get locale() {
      if (
        process.env.NODE_ENV !== 'production' &&
        !hasWarnedForAccessedLocaleParam
      ) {
        console.warn(
          `\nThe \`locale\` parameter in \`getRequestConfig\` is deprecated, please switch to \`await requestLocale\`. See https://next-intl.dev/blog/next-intl-3-22#await-request-locale\n`
        );
        hasWarnedForAccessedLocaleParam = true;
      }
      return localeOverride || getRequestLocaleLegacy();
    },

    get requestLocale() {
      return localeOverride
        ? Promise.resolve(localeOverride)
        : getRequestLocale();
    }
  };

  let result = getConfig(params);
  if (isPromise(result)) {
    result = await result;
  }

  let locale = result.locale;

  if (!locale) {
    if (
      process.env.NODE_ENV !== 'production' &&
      !hasWarnedForMissingReturnedLocale
    ) {
      console.error(
        `\nA \`locale\` is expected to be returned from \`getRequestConfig\`, but none was returned. This will be an error in the next major version of next-intl.\n\nSee: https://next-intl.dev/blog/next-intl-3-22#await-request-locale\n`
      );
      hasWarnedForMissingReturnedLocale = true;
    }

    locale = await params.requestLocale;
    if (!locale) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          `\nUnable to find \`next-intl\` locale because the middleware didn't run on this request and no \`locale\` was returned in \`getRequestConfig\`. See https://next-intl.dev/docs/routing/middleware#unable-to-find-locale. The \`notFound()\` function will be called as a result.\n`
        );
      }
      notFound();
    }
  }

  return {
    ...result,
    locale,
    now: result.now || getDefaultNow(),
    timeZone: result.timeZone || getDefaultTimeZone()
  };
}
const receiveRuntimeConfig = cache(receiveRuntimeConfigImpl);

const getFormatters = cache(_createIntlFormatters);
const getCache = cache(_createCache);

async function getConfigImpl(localeOverride?: string): Promise<
  IntlConfig & {
    getMessageFallback: NonNullable<IntlConfig['getMessageFallback']>;
    now: NonNullable<IntlConfig['now']>;
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
    _formatters: getFormatters(getCache())
  };
}
const getConfig = cache(getConfigImpl);
export default getConfig;
