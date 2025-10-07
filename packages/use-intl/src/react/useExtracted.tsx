import type {ReactNode} from 'react';
import type {
  MarkupTagsFunction,
  RichTagsFunction
} from '../core/TranslationValues.js';
import type {TranslateArgs} from '../core/createTranslator.js';
import useTranslations from './useTranslations.js';

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
  ): string {
    return t(
      undefined,
      values,
      formats,
      // @ts-expect-error -- Secret fallback parameter
      process.env.NODE_ENV !== 'production' ? message : undefined
    );
  }

  // eslint-disable-next-line react-compiler/react-compiler -- As this module gets removed during compilation, not really relevant
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

  return translateFn;
}
