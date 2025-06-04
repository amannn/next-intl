import {Locale, useLocale} from 'next-intl';

type Props = {
  locale: Locale;
};

export default function AppNavigationLocaleButton({locale}: Props) {
  const curLocale = useLocale();

  return (
    <button
      className={curLocale === locale ? 'underline' : undefined}
      name="locale"
      type="submit"
      value={locale}
    >
      {locale.toUpperCase()}
    </button>
  );
}
