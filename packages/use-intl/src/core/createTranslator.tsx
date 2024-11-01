import {ReactNode} from 'react';
import {Messages} from './AppConfig.tsx';
import Formats from './Formats.tsx';
import IntlConfig from './IntlConfig.tsx';
import MessageParams from './MessageParams.tsx';
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
    ...args: MessageParams<
      NestedValueOf<
        TranslatorMessages,
        [Namespace] extends [never] ? TargetKey : `${Namespace}.${TargetKey}`
      >
    > extends Record<string, never>
      ? [values?: undefined, formats?: Formats]
      : [
          values: MessageParams<
            NestedValueOf<
              TranslatorMessages,
              [Namespace] extends [never]
                ? TargetKey
                : `${Namespace}.${TargetKey}`
            >
          >,
          formats?: Formats
        ]
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
    ...args: MessageParams<
      NestedValueOf<
        TranslatorMessages,
        [Namespace] extends [never] ? TargetKey : `${Namespace}.${TargetKey}`
      >
    > extends Record<string, never>
      ? [values?: undefined, formats?: Formats]
      : [
          values: MessageParams<
            NestedValueOf<
              TranslatorMessages,
              [Namespace] extends [never]
                ? TargetKey
                : `${Namespace}.${TargetKey}`
            >
          >,
          formats?: Formats
        ]
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
    ...args: MessageParams<
      NestedValueOf<
        TranslatorMessages,
        [Namespace] extends [never] ? TargetKey : `${Namespace}.${TargetKey}`
      >
    > extends Record<string, never>
      ? [values?: undefined, formats?: Formats]
      : [
          values: MessageParams<
            NestedValueOf<
              TranslatorMessages,
              [Namespace] extends [never]
                ? TargetKey
                : `${Namespace}.${TargetKey}`
            >
          >,
          formats?: Formats
        ]
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
