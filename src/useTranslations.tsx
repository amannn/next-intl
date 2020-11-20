import IntlMessageFormat from 'intl-messageformat';
import {useRouter} from 'next/router';
import {useContext, useMemo, useRef} from 'react';
import NextIntlContext from './NextIntlContext';
import NextIntlMessages from './NextIntlMessages';
import TranslationValues from './TranslationValues';

function resolvePath(messages: NextIntlMessages, idPath: string) {
  let message = messages;

  idPath.split('.').forEach((part) => {
    const next = (message as any)[part];

    if (__DEV__) {
      if (!part || !next) {
        throw new Error(
          `Could not resolve \`${idPath}\` in \`${JSON.stringify(
            messages,
            null,
            2
          )}\`.`
        );
      }
    }

    message = next;
  });

  return message;
}

/**
 * Translates messages from the given path by using the ICU syntax.
 * See https://formatjs.io/docs/core-concepts/icu-syntax.
 *
 * If no path is provided, all available messages are returned.
 *
 * The path can also indicate nesting by using a dot (e.g. `namespace.Component`).
 */
export default function useTranslations(path?: string) {
  const context = useContext(NextIntlContext);
  const nextLocale = useRouter().locale;

  const cachedFormatsByLocaleRef = useRef<
    Record<string, Record<string, IntlMessageFormat>>
  >({});

  if (!context) {
    if (__DEV__) {
      throw new Error('No NextIntlContext configured.');
    } else {
      throw new Error();
    }
  }

  const locale = context.locale || nextLocale;
  const allMessages = context.messages;
  const messages = useMemo(
    () => (path ? resolvePath(allMessages, path) : allMessages),
    [allMessages, path]
  );

  if (__DEV__) {
    if (!messages) {
      throw new Error(`No messages for component \`${path}\` found.`);
    }
  }

  function translate(
    /** Use a dot to indicate a level of nesting (e.g. `namespace.nestedLabel`). */
    idPath: string,
    values?: TranslationValues
  ) {
    if (!locale) {
      if (__DEV__) {
        throw new Error('No `locale` received from `useRouter()`');
      } else {
        throw new Error();
      }
    }

    const cachedFormatsByLocale = cachedFormatsByLocaleRef.current;

    let messageFormat;
    if (cachedFormatsByLocale[locale]?.[idPath]) {
      messageFormat = cachedFormatsByLocale[locale][idPath];
    } else {
      const message = resolvePath(messages, idPath);

      if (typeof message === 'object') {
        if (__DEV__) {
          throw new Error(
            `Insufficient path specified for \`${idPath}\` in \`${path}\`.`
          );
        } else {
          throw new Error();
        }
      }

      messageFormat = new IntlMessageFormat(message, locale);

      if (!cachedFormatsByLocale[locale]) {
        cachedFormatsByLocale[locale] = {};
      }
      cachedFormatsByLocale[locale][idPath] = messageFormat;
    }

    const formattedMessage = messageFormat.format(values);

    if (__DEV__) {
      if (formattedMessage === undefined) {
        throw new Error(`Unable to format ${path}.${idPath}`);
      }
    }

    return formattedMessage;
  }

  return translate;
}
