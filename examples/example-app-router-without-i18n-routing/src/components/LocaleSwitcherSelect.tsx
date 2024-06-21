'use client';

import {ComponentProps} from 'react';
import {Locale} from '@/config';
import {setUserLocale} from '@/services/locale';

export default function LocaleSwitcherSelect(props: ComponentProps<'select'>) {
  function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const locale = event.target.value as Locale;
    setUserLocale(locale);
  }

  return <select {...props} onChange={onChange} />;
}
