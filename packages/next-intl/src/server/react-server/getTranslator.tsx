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
    ...config,
    namespace
  });
}

export default cache(getTranslatorImpl);
