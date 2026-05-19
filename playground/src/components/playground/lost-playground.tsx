'use client';

import {useState} from 'react';
import {useFormatter, useLocale, useTranslations} from 'next-intl';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';

export function LostPlayground() {
  const t = useTranslations('NotFound');
  const format = useFormatter();
  const locale = useLocale();
  const [name, setName] = useState('');
  const [score, setScore] = useState('1042');

  const trimmed = name.trim();
  const displayName = trimmed.length > 0 ? trimmed : t('placeholder');
  const value = Number(score);
  const safe = Number.isFinite(value) ? value : 0;

  return (
    <div className="flex w-full max-w-xl flex-col gap-5">
      <p className="text-2xl font-semibold leading-tight text-foreground tabular-nums sm:text-3xl">
        {t('greeting', {name: displayName})}{' '}
        <span className="text-muted-foreground">
          {t('scoreLine', {score: format.number(safe)})}
        </span>
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field htmlFor="nf-name" label={t('nameLabel')}>
          <Input
            id="nf-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('placeholder')}
            maxLength={30}
          />
        </Field>
        <Field htmlFor="nf-score" label={t('scoreLabel')}>
          <Input
            id="nf-score"
            value={score}
            inputMode="decimal"
            onChange={(e) => setScore(e.target.value)}
            maxLength={12}
          />
        </Field>
      </div>
      <p className="text-xs text-muted-foreground">{t('hint', {locale})}</p>
    </div>
  );
}

function Field({
  htmlFor,
  label,
  children
}: {
  htmlFor: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={htmlFor}
        className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground"
      >
        {label}
      </Label>
      {children}
    </div>
  );
}
