'use client';

import {useState} from 'react';
import {useFormatter, useTranslations} from 'next-intl';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

type NumStyle = 'decimal' | 'currency' | 'percent';

export function NumbersExample() {
  const t = useTranslations('NumbersDemo');
  const format = useFormatter();
  const [raw, setRaw] = useState('1234567.89');
  const [style, setStyle] = useState<NumStyle>('currency');
  const [currency, setCurrency] = useState('USD');

  const value = Number(raw);
  const safe = Number.isFinite(value) ? value : 0;

  const formatted = format.number(
    style === 'percent' ? safe / 100 : safe,
    style === 'currency'
      ? {style: 'currency', currency}
      : style === 'percent'
        ? {style: 'percent', maximumFractionDigits: 2}
        : {style: 'decimal'}
  );

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-8">
      <p className="break-all text-center text-3xl sm:text-4xl font-semibold tracking-tight text-foreground tabular-nums">
        {formatted}
      </p>
      <div className="flex flex-wrap items-end justify-center gap-x-6 gap-y-3">
        <Field label={t('value')}>
          <Input
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            inputMode="decimal"
            className="w-32"
          />
        </Field>
        <Field label={t('style')}>
          <Select value={style} onValueChange={(v) => setStyle(v as NumStyle)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(['decimal', 'currency', 'percent'] as const).map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        {style === 'currency' && (
          <Field label={t('currency')}>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['USD', 'EUR', 'GBP', 'JPY', 'CHF'].map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      </div>
    </div>
  );
}

function Field({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <Label className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
