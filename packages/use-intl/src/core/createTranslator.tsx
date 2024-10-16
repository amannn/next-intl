import {ReactElement, ReactNodeArray} from 'react';
import Formats from './Formats';
import IntlConfig from './IntlConfig';
import TranslationValues, {
  MarkupTranslationValues,
  RichTranslationValues
} from './TranslationValues';
import createTranslatorImpl from './createTranslatorImpl';
import {defaultGetMessageFallback, defaultOnError} from './defaults';
import {
  createCache,
  createIntlFormatters,
  Formatters,
  IntlCache
} from './formatters';
import MessageKeys from './utils/MessageKeys';
import NamespaceKeys from './utils/NamespaceKeys';
import NestedKeyOf from './utils/NestedKeyOf';
import NestedValueOf from './utils/NestedValueOf';

/**
 * Translates messages from the given namespace by using the ICU syntax.
 * See https://formatjs.io/docs/core-concepts/icu-syntax.
 *
 * If no namespace is provided, all available messages are returned.
 * The namespace can also indicate nesting by using a dot
 * (e.g. `namespace.Component`).
 */
export default function createTranslator<
  NestedKey extends NamespaceKeys<
    IntlMessages,
    NestedKeyOf<IntlMessages>
  > = never
>({
  _cache = createCache(),
  _formatters = createIntlFormatters(_cache),
  getMessageFallback = defaultGetMessageFallback,
  messages,
  namespace,
  onError = defaultOnError,
  ...rest
}: Omit<IntlConfig<IntlMessages>, 'defaultTranslationValues' | 'messages'> & {
  messages?: IntlConfig<IntlMessages>['messages'];
  namespace?: NestedKey;
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
    formats?: Formats
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
    formats?: Formats
  ): string | ReactElement | ReactNodeArray;

  // `markup`
  markup<
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
    values?: MarkupTranslationValues,
    formats?: Formats
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

  // `has`
  has<
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
  ): boolean;
} {
  // We have to wrap the actual function so the type inference for the optional
  // namespace works correctly. See https://stackoverflow.com/a/71529575/343045
  // The prefix ("!") is arbitrary.
  return createTranslatorImpl<
    {'!': IntlMessages},
    [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
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
