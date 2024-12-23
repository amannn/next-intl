import {cache} from 'react';
import {createFormatter} from 'use-intl/core';
import getDefaultNow from './getDefaultNow.tsx';

function getFormatterCachedImpl(config: Parameters<typeof createFormatter>[0]) {
  // same here?
  // also add a test
  // also for getTranslations/useTranslations
  // add a test with a getter maybe, don't mock
  return createFormatter({
    ...config,
    // Only init when necessary to avoid triggering a `dynamicIO` error
    // unnecessarily (`now` is only needed for `format.relativeTime`)
    get now() {
      return config.now ?? getDefaultNow();
    }
  });
}
const getFormatterCached = cache(getFormatterCachedImpl);

export default getFormatterCached;
