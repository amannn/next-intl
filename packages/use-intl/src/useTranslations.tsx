import {ReactElement, ReactNodeArray} from 'react';
import Formats from './Formats';
import IntlError, {IntlErrorCode} from './IntlError';
import TranslationValues, {RichTranslationValues} from './TranslationValues';
import useIntlContext from './useIntlContext';
import useTranslationsImpl from './useTranslationsImpl';
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
export default function useTranslations<
  NestedKey extends NamespaceKeys<GlobalMessages, NestedKeyOf<GlobalMessages>>
>(
  namespace?: NestedKey
): // Explicitly defining the return type is necessary as TypeScript would get it wrong
{
  // Default invocation
  <
    TargetKey extends MessageKeys<
      NestedValueOf<
        {'!': GlobalMessages},
        NamespaceKeys<
          GlobalMessages,
          NestedKeyOf<GlobalMessages>
        > extends NestedKey
          ? '!'
          : `!.${NestedKey}`
      >,
      NestedKeyOf<
        NestedValueOf<
          {'!': GlobalMessages},
          NamespaceKeys<
            GlobalMessages,
            NestedKeyOf<GlobalMessages>
          > extends NestedKey
            ? '!'
            : `!.${NestedKey}`
        >
      >
    >
  >(
    key: TargetKey,
    values?: TranslationValues,
    formats?: Partial<Formats>
  ): string;

  // `rich`
  rich(
    key: string,
    values?: RichTranslationValues,
    formats?: Partial<Formats>
  ): string | ReactElement | ReactNodeArray;

  // `raw`
  raw(key: string): any;
} {
  const context = useIntlContext();

  const messages = context.messages as GlobalMessages;
  if (!messages) {
    const intlError = new IntlError(
      IntlErrorCode.MISSING_MESSAGE,
      __DEV__ ? `No messages were configured on the provider.` : undefined
    );
    context.onError(intlError);
    throw intlError;
  }

  // We have to wrap the actual hook so the type inference for the optional
  // namespace works correctly. See https://stackoverflow.com/a/71529575/343045
  // The prefix ("!"") is arbitrary, but we have to use some.
  return useTranslationsImpl<
    {'!': GlobalMessages},
    NamespaceKeys<GlobalMessages, NestedKeyOf<GlobalMessages>> extends NestedKey
      ? '!'
      : `!.${NestedKey}`
  >(
    {'!': messages},
    // @ts-ignore
    namespace ? `!.${namespace}` : '!',
    '!'
  );
}
