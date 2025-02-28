import type AbstractIntlMessages from './AbstractIntlMessages.js';
import type {InitializedIntlConfig} from './IntlConfig.js';
import type {NestedKeyOf} from './MessageKeys.js';
import createBaseTranslator from './createBaseTranslator.js';
import type {Formatters, IntlCache} from './formatters.js';
import resolveNamespace from './resolveNamespace.js';

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
