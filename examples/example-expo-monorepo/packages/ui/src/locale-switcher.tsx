'use client';

import {_useExtracted as useExtracted} from 'use-intl/react';
import type {ReactNode} from 'react';

export type SharedLocale = 'en' | 'de';

interface LocaleSwitcherProps {
  readonly locale: SharedLocale;
  readonly setLocale: (next: SharedLocale) => void;
  /** Render an option button. Lets each app decide the platform widget. */
  readonly Button: (props: {
    readonly isActive: boolean;
    readonly onPress: () => void;
    readonly children: ReactNode;
  }) => ReactNode;
  /** Renderer for the surrounding label. */
  readonly Label: (props: {readonly children: ReactNode}) => ReactNode;
}

const LOCALES: ReadonlyArray<{readonly id: SharedLocale; readonly flag: string}> = [
  {id: 'en', flag: '🇬🇧'},
  {id: 'de', flag: '🇩🇪'}
];

export function LocaleSwitcher({locale, setLocale, Button, Label}: LocaleSwitcherProps) {
  const t = useExtracted('shared-ui.locale-switcher');

  return (
    <>
      <Label>{t('Language')}</Label>
      {LOCALES.map((option) => (
        <Button
          key={option.id}
          isActive={locale === option.id}
          onPress={() => setLocale(option.id)}>
          {`${option.flag} ${option.id.toUpperCase()}`}
        </Button>
      ))}
    </>
  );
}
