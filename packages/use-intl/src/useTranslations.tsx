import GlobalMessages from './GlobalMessages';
import useIntlContext from './useIntlContext';
import useTranslationsImpl from './useTranslationsImpl';
import NamespaceKeys from './utils/NamespaceKeys';
import NestedKeyOf from './utils/NestedKeyOf';

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
>(namespace?: NestedKey) {
  const {messages} = useIntlContext();
  if (!messages) throw new Error('TODO')

  // We have to wrap the actual hook so the type inference for the optional
  // namespace works correctly. See https://stackoverflow.com/a/71529575/343045
  return useTranslationsImpl<
    {__private: GlobalMessages},
    NamespaceKeys<GlobalMessages, NestedKeyOf<GlobalMessages>> extends NestedKey
      ? '__private'
      : `__private.${NestedKey}`
  >(
    {__private: messages},
    // @ts-expect-error No known fix to avoid this
    namespace ? `__private.${namespace}` : '__private'
  );
}
