import {ReactNode} from 'react';
import {Messages} from '../core/AppConfig.tsx';
import Formats from '../core/Formats.tsx';
import TranslationValues, {
  MarkupTranslationValues,
  RichTranslationValues
} from '../core/TranslationValues.tsx';
import MessageKeys from '../core/utils/MessageKeys.tsx';
import NamespaceKeys from '../core/utils/NamespaceKeys.tsx';
import NestedKeyOf from '../core/utils/NestedKeyOf.tsx';
import NestedValueOf from '../core/utils/NestedValueOf.tsx';
import useIntlContext from './useIntlContext.tsx';
import useTranslationsImpl from './useTranslationsImpl.tsx';

/**
 * Translates messages from the given namespace by using the ICU syntax.
 * See https://formatjs.io/docs/core-concepts/icu-syntax.
 *
 * If no namespace is provided, all available messages are returned.
 * The namespace can also indicate nesting by using a dot
 * (e.g. `namespace.Component`).
 */
export default function useTranslations<
  NestedKey extends NamespaceKeys<Messages, NestedKeyOf<Messages>> = never
>(
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
  const context = useIntlContext();
  const messages = context.messages as Messages;

  // We have to wrap the actual hook so the type inference for the optional
  // namespace works correctly. See https://stackoverflow.com/a/71529575/343045
  // The prefix ("!") is arbitrary.
  return useTranslationsImpl<
    {'!': Messages},
    [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
  >(
    {'!': messages},
    // @ts-expect-error
    namespace ? `!.${namespace}` : '!',
    '!'
  );
}
