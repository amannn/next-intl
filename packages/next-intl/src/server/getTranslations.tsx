/* eslint-disable import/default */

import {cache} from 'react';
import type Formats from 'use-intl/dist/src/core/Formats';
import type TranslationValues from 'use-intl/dist/src/core/TranslationValues';
import createBaseTranslator, {
  getMessagesOrError
} from 'use-intl/dist/src/core/createBaseTranslator';
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

Learn more: https://next-intl-docs.vercel.app/docs/next-13/server-components#using-internationalization-outside-of-components
  `);
    hasWarned = true;
  }

  const locale = getLocaleFromHeader();
  const config = await getConfig(locale);

  const messagesOrError = getMessagesOrError({
    messages: config.messages as any,
    namespace,
    onError: config.onError
  });

  // We allow to resolve rich text formatting here, but the types forbid it when
  // `getTranslations` is used directly. Supporting rich text is important when
  // the react-server implementation calls into this function.
  // @ts-ignore
  return createBaseTranslator({
    ...config,
    namespace,
    messagesOrError
  });
}

export default cache(getTranslationsImpl);
