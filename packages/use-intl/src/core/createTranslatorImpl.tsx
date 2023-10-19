import AbstractIntlMessages from './AbstractIntlMessages';
import {InitializedIntlConfig} from './IntlConfig';
import MessageFormatCache from './MessageFormatCache';
import createBaseTranslator from './createBaseTranslator';
import resolveNamespace from './resolveNamespace';
import NestedKeyOf from './utils/NestedKeyOf';

export type CreateTranslatorImplProps<Messages> = Omit<
  InitializedIntlConfig,
  'messages'
> & {
  namespace: string;
  messages: Messages;
  messageFormatCache?: MessageFormatCache;
};

export default function createTranslatorImpl<
  Messages extends AbstractIntlMessages,
  NestedKey extends NestedKeyOf<Messages>
>(
  {
    getMessageFallback,
    messages,
    namespace,
    onError,
    ...rest
  }: CreateTranslatorImplProps<Messages>,
  namespacePrefix: string
) {
  // The `namespacePrefix` is part of the type system.
  // See the comment in the function invocation.
  messages = messages[namespacePrefix] as Messages;
  namespace = resolveNamespace(namespace, namespacePrefix) as NestedKey;

  return createBaseTranslator<Messages, NestedKey>({
    ...rest,
    onError,
    getMessageFallback,
    messages,
    namespace
  });
}
