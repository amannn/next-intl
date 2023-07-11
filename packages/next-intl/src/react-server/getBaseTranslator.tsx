/* eslint-disable import/default -- False positives */

import {ReactElement, ReactNodeArray, cache} from 'react';
import type Formats from 'use-intl/dist/src/core/Formats';
import type TranslationValues from 'use-intl/dist/src/core/TranslationValues';
import type {RichTranslationValues} from 'use-intl/dist/src/core/TranslationValues';
import createBaseTranslator, {
  getMessagesOrError
} from 'use-intl/dist/src/core/createBaseTranslator';
import MessageKeys from 'use-intl/dist/src/core/utils/MessageKeys';
import NamespaceKeys from 'use-intl/dist/src/core/utils/NamespaceKeys';
import NestedKeyOf from 'use-intl/dist/src/core/utils/NestedKeyOf';
import NestedValueOf from 'use-intl/dist/src/core/utils/NestedValueOf';
import getConfig from '../server/getConfig';

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
    values?: RichTranslationValues,
    formats?: Partial<Formats>
  ): string | ReactElement | ReactNodeArray;

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

  const messagesOrError = getMessagesOrError({
    messages: config.messages as any,
    namespace,
    onError: config.onError
  });

  return createBaseTranslator({
    ...config,
    namespace,
    messagesOrError
  });
}

export default cache(getTranslatorImpl);
