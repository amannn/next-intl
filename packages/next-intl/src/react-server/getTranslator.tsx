import {ReactNode, cache} from 'react';
import {
  Formats,
  MarkupTranslationValues,
  MessageKeys,
  Messages,
  NamespaceKeys,
  NestedKeyOf,
  NestedValueOf,
  RichTranslationValues,
  TranslationValues,
  createTranslator
} from 'use-intl/core';

function getTranslatorImpl<
  NestedKey extends NamespaceKeys<Messages, NestedKeyOf<Messages>> = never
>(
  config: Parameters<typeof createTranslator>[0],
  namespace?: NestedKey
): // Explicitly defining the return type is necessary as TypeScript would get it wrong
{
  // Default invocation
  <
    TargetKey extends MessageKeys<
      NestedValueOf<
        {'!': Messages},
        [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
      >,
      NestedKeyOf<
        NestedValueOf<
          {'!': Messages},
          [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
        >
      >
    >
  >(
    key: TargetKey,
    values?: TranslationValues,
    formats?: Formats
  ): string;

  // `rich`
  rich<
    TargetKey extends MessageKeys<
      NestedValueOf<
        {'!': Messages},
        [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
      >,
      NestedKeyOf<
        NestedValueOf<
          {'!': Messages},
          [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
        >
      >
    >
  >(
    key: TargetKey,
    values?: RichTranslationValues,
    formats?: Formats
  ): ReactNode;

  // `markup`
  markup<
    TargetKey extends MessageKeys<
      NestedValueOf<
        {'!': Messages},
        [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
      >,
      NestedKeyOf<
        NestedValueOf<
          {'!': Messages},
          [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
        >
      >
    >
  >(
    key: TargetKey,
    values?: MarkupTranslationValues,
    formats?: Formats
  ): string;

  // `raw`
  raw<
    TargetKey extends MessageKeys<
      NestedValueOf<
        {'!': Messages},
        [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
      >,
      NestedKeyOf<
        NestedValueOf<
          {'!': Messages},
          [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
        >
      >
    >
  >(
    key: TargetKey
  ): any;

  // `has`
  has<
    TargetKey extends MessageKeys<
      NestedValueOf<
        {'!': Messages},
        [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
      >,
      NestedKeyOf<
        NestedValueOf<
          {'!': Messages},
          [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
        >
      >
    >
  >(
    key: TargetKey
  ): boolean;
} {
  return createTranslator({
    ...config,
    namespace
  });
}

export default cache(getTranslatorImpl);
