'use client';

import {useState} from 'react';
import {useFormatter, useNow, useTranslations} from 'next-intl';
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

type Style = 'full' | 'long' | 'medium' | 'short';

export function DatesExample() {
  const t = useTranslations('DatesDemo');
  const format = useFormatter();
  const now = useNow();
  const [dateStyle, setDateStyle] = useState<Style>('long');
  const [timeStyle, setTimeStyle] = useState<Style | 'none'>('short');

  const formatted = format.dateTime(now, {
    dateStyle,
    ...(timeStyle !== 'none' ? {timeStyle} : {})
  });

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-8">
      <p className="text-center text-3xl sm:text-4xl font-semibold tracking-tight text-foreground tabular-nums">
        {formatted}
      </p>
      <div className="flex flex-wrap items-end justify-center gap-x-6 gap-y-3">
        <Pill label={t('dateStyle')}>
          <Select
            value={dateStyle}
            onValueChange={(v) => setDateStyle(v as Style)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(['full', 'long', 'medium', 'short'] as const).map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Pill>
        <Pill label={t('timeStyle')}>
          <Select
            value={timeStyle}
            onValueChange={(v) => setTimeStyle(v as Style | 'none')}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(['none', 'full', 'long', 'medium', 'short'] as const).map(
                (o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </Pill>
      </div>
    </div>
  );
}

function Pill({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <Label className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
