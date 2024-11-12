import {cache} from 'react';
import {
  Messages,
  NamespaceKeys,
  NestedKeyOf,
  createTranslator
} from 'use-intl/core';

function getTranslatorImpl<
  NestedKey extends NamespaceKeys<Messages, NestedKeyOf<Messages>> = never
>(
  config: Parameters<typeof createTranslator>[0],
  namespace?: NestedKey
): ReturnType<typeof createTranslator<Messages, NestedKey>> {
  return createTranslator({
    locale: config.locale,
    _cache: config._cache,
    _formatters: config._formatters,
    formats: config.formats,
    getMessageFallback: config.getMessageFallback,
    messages: config.messages,
    onError: config.onError,
    timeZone: config.timeZone,
    namespace
    // We don't pass `now` here because a) it's not needed and b) it might
    // require reading the current time, which causes an error with `dynamicIO`
  });
}

export default cache(getTranslatorImpl);
