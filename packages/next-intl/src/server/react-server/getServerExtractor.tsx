import {type ReactNode, cache} from 'react';
import type {createTranslator} from 'use-intl/core';
import type {_useExtracted as useExtractedType} from 'use-intl/react';
import getServerTranslator from './getServerTranslator.js';

type Return = ReturnType<typeof getServerTranslator>;

// Note: This API is usually compiled into `useTranslations`,
// but there is some fallback handling which allows this hook
// to still work when not being compiled.
//
// This is relevant for:
// - Isolated environments like tests, Storybook, etc.
// - Fallbacks in case an extracted message is not yet available
function getServerExtractorImpl(
  config: Parameters<typeof createTranslator>[0],
  namespace?: string
) {
  const t = getServerTranslator(config, namespace);

  function translateFn(
    ...[message, values, formats]: Parameters<Return>
  ): string {
    return t(
      undefined,
      values,
      formats,
      // @ts-expect-error -- Secret fallback parameter
      process.env.NODE_ENV !== 'production' ? message : undefined
    );
  }

  translateFn.rich = function translateRichFn(
    ...[message, values, formats]: Parameters<Return['rich']>
  ): ReactNode {
    return t.rich(
      undefined,
      values,
      formats,
      // @ts-expect-error -- Secret fallback parameter
      process.env.NODE_ENV !== 'production' ? message : undefined
    );
  };

  translateFn.markup = function translateMarkupFn(
    ...[message, values, formats]: Parameters<Return['markup']>
  ): string {
    return t.markup(
      undefined,
      values,
      formats,
      // @ts-expect-error -- Secret fallback parameter
      process.env.NODE_ENV !== 'production' ? message : undefined
    );
  };

  translateFn.has = function translateHasFn(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ...[message]: Parameters<Return['has']>
  ): boolean {
    // Not really something better we can do here
    return true;
  };

  return translateFn as ReturnType<typeof useExtractedType>;
}

export default cache(getServerExtractorImpl);
