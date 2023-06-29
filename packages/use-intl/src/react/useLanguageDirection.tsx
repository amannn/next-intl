import useIntlContext from './useIntlContext';

export default function useLanguageDirection(): 'ltr' | 'rtl' {
  // We split the locale at the first dash to support locales such as `en-US` to be detected as `en`.
  const locale = useIntlContext().locale.split('-')[0];

  const rtlLanguages = [
    'ar', // Arabic
    'he', // Hebrew
    'fa', // Persian
    'ur', // Urdu
    'ps', // Pashto
    'yi', // Yiddish
    'dv', // Divehi
    'ku', // Kurdish
    'sd', // Sindhi
    'ckb', // Central Kurdish
    'ug' // Uyghur
  ];

  return rtlLanguages.includes(locale) ? 'rtl' : 'ltr';
}
