import type {ReactNode} from 'react';
import type {
  MarkupTagsFunction,
  RichTagsFunction
} from '../core/TranslationValues.js';
import type {TranslateArgs} from '../core/createTranslator.js';
import useTranslations from './useTranslations.js';

type TranslateArgsObject<
  Value extends string,
  TagsFn extends RichTagsFunction | MarkupTagsFunction = never
> =
  TranslateArgs<Value, TagsFn> extends readonly [any?, any?]
    ? undefined extends TranslateArgs<Value, TagsFn>[0]
      ? {
          values?: TranslateArgs<Value, TagsFn>[0];
          formats?: TranslateArgs<Value, TagsFn>[1];
        }
      : {
          values: TranslateArgs<Value, TagsFn>[0];
          formats?: TranslateArgs<Value, TagsFn>[1];
        }
    : never;

function getArgs<
  Message extends string,
  TagsFn extends RichTagsFunction | MarkupTagsFunction = never
>(
  messageOrParams:
    | Message
    | ({
        id: string;
        message: Message;
      } & TranslateArgsObject<Message, TagsFn>),
  ...rest: TranslateArgs<Message, TagsFn>
): [
  string | undefined,
  TranslateArgs<Message, TagsFn>[0],
  TranslateArgs<Message, TagsFn>[1]
] {
  let message, values, formats;
  if (typeof messageOrParams === 'string') {
    message = messageOrParams;
    values = rest[0];
    formats = rest[1];
  } else {
    message = messageOrParams.message;
    values = messageOrParams.values;
    formats = messageOrParams.formats;
  }
  // @ts-expect-error -- Secret fallback parameter
  return [
    undefined, // Always use fallback if not compiled
    values,
    formats,
    process.env.NODE_ENV !== 'production' ? message : undefined
  ];
}

// Note: This API is usually compiled into `useTranslations`,
// but there is some fallback handling which allows this hook
// to still work when not being compiled.
//
// This is relevant for:
// - Isolated environments like tests, Storybook, etc.
// - Fallbacks in case an extracted message is not yet available
export default function useExtracted(namespace?: string) {
  const t = useTranslations(namespace);

  function translateFn<Message extends string>(
    /** Inline ICU message in the source locale. */
    message: Message,
    ...[values, formats]: TranslateArgs<Message>
  ): string;
  function translateFn<Message extends string>(
    params: {
      id: string;
      /** Inline ICU message in the source locale. */
      message: Message;
    } & TranslateArgsObject<Message>
  ): string;
  function translateFn(...params: Parameters<typeof getArgs>): string {
    // @ts-expect-error -- Passing `undefined` as an ID is secretly allowed here
    return t(...getArgs(...params));
  }

  translateFn.rich = ((...params: Parameters<typeof getArgs>): ReactNode =>
    // @ts-expect-error -- Passing `undefined` as an ID is secretly allowed here
    t.rich(...getArgs(...params))) as {
    <Message extends string>(
      message: Message,
      ...[values, formats]: TranslateArgs<Message, RichTagsFunction>
    ): ReactNode;
    <Message extends string>(
      params: {
        id: string;
        /** Inline ICU message in the source locale. */
        message: Message;
      } & TranslateArgsObject<Message, RichTagsFunction>
    ): ReactNode;
  };

  translateFn.markup = ((...params: Parameters<typeof getArgs>): string =>
    // @ts-expect-error -- Passing `undefined` as an ID is secretly allowed here
    t.markup(...getArgs(...params))) as {
    <Message extends string>(
      message: Message,
      ...[values, formats]: TranslateArgs<Message, MarkupTagsFunction>
    ): string;
    <Message extends string>(
      params: {
        id: string;
        /** Inline ICU message in the source locale. */
        message: Message;
      } & TranslateArgsObject<Message, MarkupTagsFunction>
    ): string;
  };

  translateFn.has = function translateHasFn<Message extends string>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    message: Message
  ): boolean {
    // Not really something better we can do here
    return true;
  };

  return translateFn;
}
