import {Formats, TranslationValues} from '../core';
import {CreateTranslatorProps} from '../core/createTranslator';
import MessageKeys from '../core/utils/MessageKeys';
import NamespaceKeys from '../core/utils/NamespaceKeys';
import NestedKeyOf from '../core/utils/NestedKeyOf';
import NestedValueOf from '../core/utils/NestedValueOf';
import createTranslatorImpl, {
  ServerRichTranslationValues
} from './createTranslatorImpl';

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
  messages,
  namespace,
  ...rest
}: Omit<
  CreateTranslatorProps<IntlMessages>,
  'messagesOrError' | 'namespace'
> & {
  messages: IntlMessages;
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
    values?: ServerRichTranslationValues,
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
  return createTranslatorImpl<
    {'!': IntlMessages},
    [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
  >({
    ...rest,
    messages: {'!': messages},
    // @ts-ignore
    namespace: namespace ? `!.${namespace}` : '!'
  });
}
