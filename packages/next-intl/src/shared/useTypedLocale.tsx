import {AllLocales} from './types';

export default function useTypedLocale<
  Locales extends AllLocales
>(): (typeof locales)[number] {
  const locale = useLocale();
  const isValid = locales.includes(locale as any);
  if (!isValid) {
    throw new Error(
      process.env.NODE_ENV !== 'production'
        ? `Invalid locale: ${locale}`
        : undefined
    );
  }
  return locale;
}
