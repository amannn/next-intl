import AbstractIntlMessages from './AbstractIntlMessages.tsx';
import {InitializedIntlConfig} from './IntlConfig.tsx';
import {NestedKeyOf} from './MessageKeys.tsx';
import createBaseTranslator from './createBaseTranslator.tsx';
import {Formatters, IntlCache} from './formatters.tsx';
import resolveNamespace from './resolveNamespace.tsx';

export type CreateTranslatorImplProps<Messages> = Omit<
  InitializedIntlConfig,
  'messages'
> & {
  namespace: string;
  messages: Messages;
  formatters: Formatters;
  cache: IntlCache;
};

export default function createTranslatorImpl<
  Messages extends AbstractIntlMessages,
  NestedKey extends NestedKeyOf<Messages>
>(
  {messages, namespace, ...rest}: CreateTranslatorImplProps<Messages>,
  namespacePrefix: string
) {
  // The `namespacePrefix` is part of the type system.
  // See the comment in the function invocation.
  messages = messages[namespacePrefix] as Messages;
  namespace = resolveNamespace(namespace, namespacePrefix) as NestedKey;

  return createBaseTranslator<Messages, NestedKey>({
    ...rest,
    messages,
    namespace
  });
}
