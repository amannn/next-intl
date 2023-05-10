import {useLocale, useTranslations} from 'next-intl';
import LocaleSwitcherSelect from './LocaleSwitcherSelect';

export default function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();

  return (
    <label className="relative text-gray-400">
      <p className="sr-only">{t('label')}</p>
      <LocaleSwitcherSelect
        className="inline-flex appearance-none bg-transparent py-3 pl-2 pr-6"
        defaultValue={locale}
      >
        {['en', 'de'].map((cur) => (
          <option key={cur} value={cur}>
            {t('locale', {locale: cur})}
          </option>
        ))}
      </LocaleSwitcherSelect>
      <span className="pointer-events-none absolute top-[8px] right-2">⌄</span>
    </label>
  );
}
