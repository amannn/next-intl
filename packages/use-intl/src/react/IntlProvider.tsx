import React, {ReactNode, useMemo} from 'react';
import IntlConfig from '../core/IntlConfig';
import {
  Formatters,
  createCache,
  createIntlFormatters
} from '../core/formatters';
import initializeConfig from '../core/initializeConfig';
import IntlContext from './IntlContext';

type Props = IntlConfig & {
  children: ReactNode;
};

export default function IntlProvider({
  children,
  defaultTranslationValues,
  formats,
  getMessageFallback,
  locale,
  messages,
  now,
  onError,
  timeZone
}: Props) {
  // The formatter cache is released when the locale changes. For
  // long-running apps with a persistent `IntlProvider` at the root,
  // this can reduce the memory footprint (e.g. in React Native).
  const cache = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    locale;
    return createCache();
  }, [locale]);
  const formatters: Formatters = useMemo(
    () => createIntlFormatters(cache),
    [cache]
  );

  // Memoizing this value helps to avoid triggering a re-render of all
  // context consumers in case the configuration didn't change. However,
  // if some of the non-primitive values change, a re-render will still
  // be triggered. Note that there's no need to put `memo` on `IntlProvider`
  // itself, because the `children` typically change on every render.
  // There's some burden on the consumer side if it's important to reduce
  // re-renders, put that's how React works.
  // See: https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/#context-updates-and-render-optimizations
  const value = useMemo(
    () => ({
      ...initializeConfig({
        locale,
        defaultTranslationValues,
        formats,
        getMessageFallback,
        messages,
        now,
        onError,
        timeZone
      }),
      formatters,
      cache
    }),
    [
      cache,
      defaultTranslationValues,
      formats,
      formatters,
      getMessageFallback,
      locale,
      messages,
      now,
      onError,
      timeZone
    ]
  );

  return <IntlContext.Provider value={value}>{children}</IntlContext.Provider>;
}
