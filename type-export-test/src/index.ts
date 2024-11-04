import {
  createFormatter,
  createTranslator,
  initializeConfig,
  useFormatter,
  useLocale,
  useMessages,
  useNow,
  useTimeZone,
  useTranslations
} from 'next-intl';

export function useExports() {
  const messages = useMessages();
  const now = useNow();
  const locale = useLocale();
  const timezone = useTimeZone();
  const formatter = useFormatter();
  const translations = useTranslations();

  return {
    messages,
    now,
    locale,
    timezone,
    formatter,
    translations
  };
}

export const config = initializeConfig({
  locale: 'en'
});

export const translator = createTranslator({
  locale: 'en'
});

export const formatter = createFormatter({
  locale: 'en',
  now: new Date(2022, 10, 6, 20, 20, 0, 0)
});
