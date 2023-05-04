import Formats from './Formats';
import IntlConfig from './IntlConfig';
import TranslationValues from './TranslationValues';
import createTranslatorImpl, {
  CoreRichTranslationValues
} from './createTranslatorImpl';
import {defaultGetMessageFallback, defaultOnError} from './defaults';
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
  getMessageFallback = defaultGetMessageFallback,
  messages,
  namespace,
  onError = defaultOnError,
  ...rest
}: Omit<IntlConfig<IntlMessages>, 'defaultTranslationValues' | 'messages'> & {
  messages: NonNullable<IntlConfig<IntlMessages>['messages']>;
  namespace?: NestedKey;
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
      getMessageFallback,
      messages: {'!': messages},
      // @ts-ignore
      namespace: namespace ? `!.${namespace}` : '!'
    },
    '!'
  );
}
