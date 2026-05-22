'use client';

import {useLocale} from 'next-intl';
import {LocaleSwitcher, type SharedLocale} from '@example-monorepo/ui';

import {useLocaleAction} from '@/i18n/locale-action-context';

export function LocaleSwitcherCard() {
  const currentLocale = useLocale() as SharedLocale;
  const {setLocale, isPending} = useLocaleAction();

  return (
    <section
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
        opacity: isPending ? 0.6 : 1
      }}>
      <LocaleSwitcher
        locale={currentLocale}
        setLocale={setLocale}
        Label={({children}) => (
          <span style={{color: '#5f6b8a', fontSize: 14}}>{children}</span>
        )}
        Button={({isActive, onPress, children}) => (
          <button
            type="button"
            onClick={onPress}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              border: '1px solid',
              borderColor: isActive ? '#3c87f7' : '#d3d8e8',
              background: isActive ? '#3c87f7' : 'transparent',
              color: isActive ? '#fff' : '#1d2240',
              cursor: 'pointer'
            }}>
            {children}
          </button>
        )}
      />
    </section>
  );
}
