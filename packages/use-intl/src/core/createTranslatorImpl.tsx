import AbstractIntlMessages from './AbstractIntlMessages';
import {InitializedIntlConfig} from './IntlConfig';
import createBaseTranslator from './createBaseTranslator';
import {Formatters} from './formatters';
import resolveNamespace from './resolveNamespace';
import NestedKeyOf from './utils/NestedKeyOf';

export type CreateTranslatorImplProps<Messages> = Omit<
  InitializedIntlConfig,
  'messages'
> & {
  namespace: string;
  messages: Messages;
  formatters: Formatters;
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
