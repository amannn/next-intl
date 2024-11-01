import {Messages} from '../core/AppConfig.tsx';
import {NamespaceKeys, NestedKeyOf} from '../core/TypesafeKeys.tsx';
import type createTranslator from '../core/createTranslator.tsx';
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
): ReturnType<typeof createTranslator<Messages, NestedKey>> {
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
