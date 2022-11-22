import IntlMessageFormat from "intl-messageformat";

import { Formats, RichTranslationValues } from "../core";
import createBaseTranslator, {
  getMessagesOrError,
} from "../core/createBaseTranslator";
import resolveNamespace from "../core/resolveNamespace";
import MessageKeys from "../core/utils/MessageKeys";
import NamespaceKeys from "../core/utils/NamespaceKeys";
import NestedKeyOf from "../core/utils/NestedKeyOf";
import NestedValueOf from "../core/utils/NestedValueOf";
import { IntlContextValue } from "./IntlContext";

const cachedFormatsByLocaleRef: Record<
  string,
  Record<string, IntlMessageFormat>
> = {};

type Rich = [RichTranslationValues?, Partial<Formats>?];

type Raw = [];

export default function getTranslation<
  NestedKey extends NamespaceKeys<IntlMessages, NestedKeyOf<IntlMessages>>,
  NestedKeyValue extends MessageKeys<
    NestedValueOf<
      { "!": IntlMessages },
      [NestedKey] extends [never] ? "!" : `!.${NestedKey}`
    >,
    NestedKeyOf<
      NestedValueOf<
        { "!": IntlMessages },
        [NestedKey] extends [never] ? "!" : `!.${NestedKey}`
      >
    >
  >,
  ExtraKey extends "rich" | "raw",
  ExtraArgs extends ExtraKey extends "rich"
    ? Rich
    : Raw
>(
  baseNamespace: NestedKey,
  message: NestedKeyValue,
  specialIdentifier?: ExtraKey,
  ...specialArgs: ExtraArgs
) {
  // TODO: should check if IntlContextValue has actual value from provider
  const {
    defaultTranslationValues,
    formats: globalFormats,
    getMessageFallback,
    locale,
    onError,
    timeZone,
  } = IntlContextValue;

  const messages = IntlContextValue.messages as IntlMessages;

  const namespace = resolveNamespace(`!.${baseNamespace}`, "!") as NestedKeyOf<
    typeof messages
  >;

  const translate = createBaseTranslator({
    cachedFormatsByLocale: cachedFormatsByLocaleRef,
    getMessageFallback,
    messagesOrError: getMessagesOrError({
      messages,
      namespace,
      onError,
    }),
    defaultTranslationValues,
    namespace,
    onError,
    formats: globalFormats,
    locale,
    timeZone,
  });

  if (specialIdentifier && specialArgs) {
    // @ts-ignore -- if you know how to fix this TS error, that'd be much appreciated
    return translate[specialIdentifier](message, ...specialArgs);
  }

  return translate(message);
}
