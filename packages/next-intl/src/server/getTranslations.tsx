import {cache} from 'react';
import {
  createTranslator,
  Formats,
  TranslationValues,
  RichTranslationValuesPlain,
  MessageKeys,
  NamespaceKeys,
  NestedKeyOf,
  NestedValueOf
} from 'use-intl/core';
import {getRequestLocale} from './RequestLocale';
import getConfig from './getConfig';

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
    values?: RichTranslationValuesPlain,
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
  if (process.env.NODE_ENV !== 'production' && !hasWarned) {
    console.warn(`
\`getTranslations\` is deprecated, please switch to \`getTranslator\`.

Learn more: https://next-intl-docs.vercel.app/docs/environments/metadata-route-handlers
  `);
    hasWarned = true;
  }

  const locale = getRequestLocale();
  const config = await getConfig(locale);

  return createTranslator({
    ...config,
    namespace,
    messages: config.messages || {}
  });
}

/** @deprecated Is called `getTranslator` now. */
export default cache(getTranslationsImpl);
