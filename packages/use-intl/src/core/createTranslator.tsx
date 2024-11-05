import {ReactNode} from 'react';
import {Messages} from './AppConfig.tsx';
import Formats from './Formats.tsx';
import ICUArgs from './ICUArgs.tsx';
import ICUTags from './ICUTags.tsx';
import IntlConfig from './IntlConfig.tsx';
import {
  DateTranslationValue,
  MarkupFunction,
  NumberTranslationValue,
  PlainTranslationValue,
  RichTextFunction
} from './TranslationValues.tsx';
import {
  MessageKeys,
  NamespaceKeys,
  NestedKeyOf,
  NestedValueOf
} from './TypesafeKeys.tsx';
import createTranslatorImpl from './createTranslatorImpl.tsx';
import {defaultGetMessageFallback, defaultOnError} from './defaults.tsx';
import {
  Formatters,
  IntlCache,
  createCache,
  createIntlFormatters
} from './formatters.tsx';
import {OnlyOptional, Prettify} from './types.tsx';

type ICUArgsWithTags<
  MessageString extends string,
  TagsFn extends RichTextFunction | MarkupFunction = never
> = ICUArgs<
  MessageString,
  PlainTranslationValue,
  NumberTranslationValue,
  DateTranslationValue
> &
  ([TagsFn] extends [never] ? {} : ICUTags<MessageString, TagsFn>);

type TranslateArgs<
  Value extends string,
  Formats,
  TagsFn extends RichTextFunction | MarkupFunction = never
> =
  // If an unknown string is passed, allow any values
  string extends Value
    ? [
        values?: Record<string, PlainTranslationValue | TagsFn>,
        formats?: Formats
      ]
    : (
          Value extends any
            ? (key: ICUArgsWithTags<Value, TagsFn>) => void
            : never
        ) extends (key: infer Args) => void
      ? OnlyOptional<Args> extends true
        ? [values?: undefined, formats?: Formats]
        : [values: Prettify<Args>, formats?: Formats]
      : never;

/**
 * Translates messages from the given namespace by using the ICU syntax.
 * See https://formatjs.io/docs/core-concepts/icu-syntax.
 *
 * If no namespace is provided, all available messages are returned.
 * The namespace can also indicate nesting by using a dot
 * (e.g. `namespace.Component`).
 */
export default function createTranslator<
  const TranslatorMessages extends Messages = Messages,
  const Namespace extends NamespaceKeys<
    TranslatorMessages,
    NestedKeyOf<TranslatorMessages>
  > = never
>({
  _cache = createCache(),
  _formatters = createIntlFormatters(_cache),
  getMessageFallback = defaultGetMessageFallback,
  messages,
  namespace,
  onError = defaultOnError,
  ...rest
}: Omit<IntlConfig<TranslatorMessages>, 'messages'> & {
  messages?: TranslatorMessages;
  namespace?: Namespace;
  /** @private */
  _formatters?: Formatters;
  /** @private */
  _cache?: IntlCache;
}): // Explicitly defining the return type is necessary as TypeScript would get it wrong
{
  // Default invocation
  <
    TargetKey extends MessageKeys<
      NestedValueOf<
        {'!': TranslatorMessages},
        [Namespace] extends [never] ? '!' : `!.${Namespace}`
      >,
      NestedKeyOf<
        NestedValueOf<
          {'!': TranslatorMessages},
          [Namespace] extends [never] ? '!' : `!.${Namespace}`
        >
      >
    >
  >(
    key: TargetKey,
    ...args: TranslateArgs<
      NestedValueOf<
        TranslatorMessages,
        [Namespace] extends [never] ? TargetKey : `${Namespace}.${TargetKey}`
      >,
      Formats
    >
  ): string;

  // `rich`
  rich<
    TargetKey extends MessageKeys<
      NestedValueOf<
        {'!': TranslatorMessages},
        [Namespace] extends [never] ? '!' : `!.${Namespace}`
      >,
      NestedKeyOf<
        NestedValueOf<
          {'!': TranslatorMessages},
          [Namespace] extends [never] ? '!' : `!.${Namespace}`
        >
      >
    >
  >(
    key: TargetKey,
    ...args: TranslateArgs<
      NestedValueOf<
        TranslatorMessages,
        [Namespace] extends [never] ? TargetKey : `${Namespace}.${TargetKey}`
      >,
      Formats,
      RichTextFunction
    >
  ): ReactNode;

  // `markup`
  markup<
    TargetKey extends MessageKeys<
      NestedValueOf<
        {'!': TranslatorMessages},
        [Namespace] extends [never] ? '!' : `!.${Namespace}`
      >,
      NestedKeyOf<
        NestedValueOf<
          {'!': TranslatorMessages},
          [Namespace] extends [never] ? '!' : `!.${Namespace}`
        >
      >
    >
  >(
    key: TargetKey,
    ...args: TranslateArgs<
      NestedValueOf<
        TranslatorMessages,
        [Namespace] extends [never] ? TargetKey : `${Namespace}.${TargetKey}`
      >,
      Formats,
      MarkupFunction
    >
  ): string;

  // `raw`
  raw<
    TargetKey extends MessageKeys<
      NestedValueOf<
        {'!': TranslatorMessages},
        [Namespace] extends [never] ? '!' : `!.${Namespace}`
      >,
      NestedKeyOf<
        NestedValueOf<
          {'!': TranslatorMessages},
          [Namespace] extends [never] ? '!' : `!.${Namespace}`
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
        {'!': TranslatorMessages},
        [Namespace] extends [never] ? '!' : `!.${Namespace}`
      >,
      NestedKeyOf<
        NestedValueOf<
          {'!': TranslatorMessages},
          [Namespace] extends [never] ? '!' : `!.${Namespace}`
        >
      >
    >
  >(
    key: TargetKey
  ): boolean;
} {
  // We have to wrap the actual function so the type inference for the optional
  // namespace works correctly. See https://stackoverflow.com/a/71529575/343045
  // The prefix ("!") is arbitrary.
  // @ts-expect-error Use the explicit annotation instead
  return createTranslatorImpl<
    {'!': TranslatorMessages},
    [Namespace] extends [never] ? '!' : `!.${Namespace}`
  >(
    {
      ...rest,
      onError,
      cache: _cache,
      formatters: _formatters,
      getMessageFallback,
      // @ts-expect-error `messages` is allowed to be `undefined` here and will be handled internally
      messages: {'!': messages},
      namespace: namespace ? `!.${namespace}` : '!'
    },
    '!'
  );
}
