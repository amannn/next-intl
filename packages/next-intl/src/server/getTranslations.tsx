/* eslint-disable import/default */

import {cache} from 'react';
import {createTranslator} from 'use-intl/dist/src/core';
import type Formats from 'use-intl/dist/src/core/Formats';
import type TranslationValues from 'use-intl/dist/src/core/TranslationValues';
import {CoreRichTranslationValues} from 'use-intl/dist/src/core/createTranslatorImpl';
import MessageKeys from 'use-intl/dist/src/core/utils/MessageKeys';
import NamespaceKeys from 'use-intl/dist/src/core/utils/NamespaceKeys';
import NestedKeyOf from 'use-intl/dist/src/core/utils/NestedKeyOf';
import NestedValueOf from 'use-intl/dist/src/core/utils/NestedValueOf';
import getConfig from './getConfig';
import getLocaleFromHeader from './getLocaleFromHeader';

let hasWarned = false;

async function getTranslationsImpl<
  NestedKey extends NamespaceKeys<
    IntlMessages,
    NestedKeyOf<IntlMessages>
  > = never
>(
  namespace?: NestedKey
): // Explicitly defining the return type is necessary as TypeScript would get it wrong
Promise<{
  // Default invocation
  <
    TargetKey extends MessageKeys<
      NestedValueOf<
        {'!': IntlMessages},
        [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
      >,
      NestedKeyOf<
        NestedValueOf<
          {'!': IntlMessages},
          [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
        >
      >
    >
  >(
    key: TargetKey,
    values?: TranslationValues,
    formats?: Partial<Formats>
  ): string;

  // `rich`
  rich<
    TargetKey extends MessageKeys<
      NestedValueOf<
        {'!': IntlMessages},
        [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
      >,
      NestedKeyOf<
        NestedValueOf<
          {'!': IntlMessages},
          [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
        >
      >
    >
  >(
    key: TargetKey,
    values?: CoreRichTranslationValues,
    formats?: Partial<Formats>
  ): string;

  // `raw`
  raw<
    TargetKey extends MessageKeys<
      NestedValueOf<
        {'!': IntlMessages},
        [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
      >,
      NestedKeyOf<
        NestedValueOf<
          {'!': IntlMessages},
          [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
        >
      >
    >
  >(
    key: TargetKey
  ): any;
}> {
  if (!hasWarned) {
    console.warn(`
\`getTranslations\` is deprecated, please switch to \`getTranslator\`.

Learn more: https://next-intl-docs.vercel.app/docs/environments/metadata-route-handlers
  `);
    hasWarned = true;
  }

  const locale = getLocaleFromHeader();
  const config = await getConfig(locale);

  return createTranslator({
    ...config,
    namespace,
    messages: config.messages || {}
  });
}

export default cache(getTranslationsImpl);
