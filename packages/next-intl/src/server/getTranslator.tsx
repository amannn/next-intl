/* eslint-disable import/default */

import {cache} from 'react';
import {createTranslator, Formats, TranslationValues} from 'use-intl/core';
import {CoreRichTranslationValues} from 'use-intl/dist/src/core/createTranslatorImpl';
import MessageKeys from 'use-intl/dist/src/core/utils/MessageKeys';
import NamespaceKeys from 'use-intl/dist/src/core/utils/NamespaceKeys';
import NestedKeyOf from 'use-intl/dist/src/core/utils/NestedKeyOf';
import NestedValueOf from 'use-intl/dist/src/core/utils/NestedValueOf';
import getConfig from './getConfig';

let hasWarned = false;

async function getTranslatorImpl<
  NestedKey extends NamespaceKeys<
    IntlMessages,
    NestedKeyOf<IntlMessages>
  > = never
>(
  locale:
    | string
    | {
        namespace?: NestedKey;
        locale: string;
      },
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
  if (typeof locale === 'object') {
    const opts = locale;
    namespace = opts.namespace;
    locale = opts.locale;
    if (!hasWarned) {
      console.warn(
        `
DEPRECATION WARNING: Calling \`getTranslator\` with an object argument is deprecated, please update your call site accordingly.

// Previously
getTranslator({locale: 'en', namespace: 'About'});

// Now
getTranslator('en', 'About');

See also https://next-intl-docs.vercel.app/docs/environments/metadata-route-handlers
`
      );
      hasWarned = true;
    }
  }

  const config = await getConfig(locale);

  return createTranslator({
    ...config,
    namespace
  });
}

export default cache(getTranslatorImpl);
