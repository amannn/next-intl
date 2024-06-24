import {LanguageIcon} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import {useLocale, useTranslations} from 'next-intl';
import LocaleSwitcherSelect from './LocaleSwitcherSelect';

export default function LocaleSwitcher({className}: {className?: string}) {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();

  return (
    <label
      className={clsx(
        className,
        'group relative inline-block rounded-sm p-2 transition-colors hover:bg-slate-200'
      )}
    >
      <p className="sr-only">{t('label')}</p>
      <LanguageIcon className="h-6 w-6 text-slate-600 transition-colors group-hover:text-slate-900" />
      <LocaleSwitcherSelect
        className="absolute inset-0 cursor-pointer appearance-none bg-transparent text-transparent"
        defaultValue={locale}
      >
        <option value="en">{t('en')}</option>
        <option value="de">{t('de')}</option>
      </LocaleSwitcherSelect>
    </label>
  );
}
