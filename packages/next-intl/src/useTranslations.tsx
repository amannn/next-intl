import IntlMessageFormat, {Formats} from 'intl-messageformat';
import {cloneElement, isValidElement, ReactNode, useMemo, useRef} from 'react';
import NextIntlMessages from './NextIntlMessages';
import TranslationValues from './TranslationValues';
import useIntlContext from './useIntlContext';
import useLocale from './useLocale';

function resolvePath(messages: NextIntlMessages, idPath: string) {
  let message = messages;

  idPath.split('.').forEach((part) => {
    const next = (message as any)[part];

    if (__DEV__) {
      if (part == null || next == null) {
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

function prepareTranslationValues(values?: TranslationValues) {
  if (!values) return values;

  // Workaround for https://github.com/formatjs/formatjs/issues/1467
  const transformedValues: TranslationValues = {};
  Object.keys(values).forEach((key) => {
    const value = values[key];

    let transformed;
    if (typeof value === 'function') {
      transformed = (children: ReactNode) => {
        const result = value(children);

        return isValidElement(result)
          ? cloneElement(result, {
              key: result.key || key + String(children)
            })
          : result;
      };
    } else {
      transformed = value;
    }

    transformedValues[key] = transformed;
  });

  return transformedValues;
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
  const context = useIntlContext();

  if (__DEV__) {
    if (!context) {
      throw new Error(
        'No `next-intl` context found. Have you configured `NextIntlProvider`?'
      );
    }
  }

  const locale = useLocale();

  const cachedFormatsByLocaleRef = useRef<
    Record<string, Record<string, IntlMessageFormat>>
  >({});

  const allMessages = context.messages;

  if (__DEV__) {
    if (!allMessages) {
      throw new Error(
        'No messages found. Have you configured `NextIntlProvider` correctly with messages?'
      );
    }
  }

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
    /** Key value pairs for values to interpolate into the message. */
    values?: TranslationValues,
    /** Provide custom formats for numbers, dates and times. */
    formats?: Partial<Formats>
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

      messageFormat = new IntlMessageFormat(message, locale, formats);

      if (!cachedFormatsByLocale[locale]) {
        cachedFormatsByLocale[locale] = {};
      }
      cachedFormatsByLocale[locale][idPath] = messageFormat;
    }

    const formattedMessage = messageFormat.format(
      prepareTranslationValues(values)
    );

    if (__DEV__) {
      if (formattedMessage === undefined) {
        throw new Error(`Unable to format ${path}.${idPath}`);
      }
    }

    return formattedMessage;
  }

  return translate;
}
