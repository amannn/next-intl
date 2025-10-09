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

// Note: This API is usually compiled into `useTranslations`,
// but there is some fallback handling which allows this hook
// to still work when not being compiled.
//
// This is relevant for:
// - Isolated environments like tests, Storybook, etc.
// - Fallbacks in case an extracted message is not yet available
export default function useExtracted(namespace?: string) {
  const t = useTranslations(namespace);

  function getArgs<Message extends string>(
    messageOrParams:
      | Message
      | ({
          id: string;
          message: Message;
        } & TranslateArgsObject<Message>),
    ...rest: TranslateArgs<Message>
  ): [
    string | undefined,
    TranslateArgs<Message>[0],
    TranslateArgs<Message>[1]
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
      undefined,
      values,
      formats,
      process.env.NODE_ENV !== 'production' ? message : undefined
    ];
  }

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
  function translateFn(...args: Parameters<typeof getArgs>): string {
    // @ts-expect-error -- Passing `undefined` as an ID is secretly allowed here
    return t(...getArgs(...args));
  }

  translateFn.rich = function translateRichFn<Message extends string>(
    message: Message,
    ...[values, formats]: TranslateArgs<Message, RichTagsFunction>
  ): ReactNode {
    return t.rich(
      undefined,
      values,
      formats,
      // @ts-expect-error -- Secret fallback parameter
      process.env.NODE_ENV !== 'production' ? message : undefined
    );
  };

  translateFn.markup = function translateMarkupFn<Message extends string>(
    message: Message,
    ...[values, formats]: TranslateArgs<Message, MarkupTagsFunction>
  ): string {
    return t.markup(
      undefined,
      values,
      formats,
      // @ts-expect-error -- Secret fallback parameter
      process.env.NODE_ENV !== 'production' ? message : undefined
    );
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
