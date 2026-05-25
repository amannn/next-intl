'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {
  NextIntlClientProvider,
  useFormatter,
  useMessages,
  type Formats
} from 'next-intl';
import {Check, Copy} from 'lucide-react';
import {routing} from '@/i18n/routing';
import {formats as registry} from '@/i18n/formats';
import {useSettings} from '@/lib/settings';
import {CodeBlock} from '@/components/code/code-block';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Checkbox} from '@/components/ui/checkbox';
import {Button} from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

type Method = 'number' | 'dateTime' | 'dateTimeRange' | 'relativeTime' | 'list';

const METHOD_LABEL: Record<Method, string> = {
  number: 'format.number',
  dateTime: 'format.dateTime',
  dateTimeRange: 'format.dateTimeRange',
  relativeTime: 'format.relativeTime',
  list: 'format.list'
};

type NumberOpts = {
  style?: 'decimal' | 'currency' | 'percent' | 'unit';
  currency?: string;
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
  currencySign?: 'standard' | 'accounting';
  useGrouping?: boolean;
  signDisplay?: 'auto' | 'always' | 'never' | 'exceptZero' | 'negative';
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
  minimumIntegerDigits?: number;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

type DateTimeOpts = {
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  weekday?: 'long' | 'short' | 'narrow';
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  hour12?: boolean;
  timeZoneName?: 'short' | 'long';
  timeZone?: string;
};

type RelativeTimeOpts = {
  unit?:
    | 'second'
    | 'minute'
    | 'hour'
    | 'day'
    | 'week'
    | 'month'
    | 'quarter'
    | 'year';
  style?: 'long' | 'short' | 'narrow';
  numeric?: 'always' | 'auto';
};

type ListOpts = {
  type?: 'conjunction' | 'disjunction' | 'unit';
  style?: 'long' | 'short' | 'narrow';
};

type State =
  | {method: 'number'; value: string; named: string | null; opts: NumberOpts}
  | {method: 'dateTime'; date: string; named: string | null; opts: DateTimeOpts}
  | {
      method: 'dateTimeRange';
      start: string;
      end: string;
      named: string | null;
      opts: DateTimeOpts;
    }
  | {
      method: 'relativeTime';
      date: string;
      now: string;
      opts: RelativeTimeOpts;
    }
  | {method: 'list'; items: string; named: string | null; opts: ListOpts};

const defaultState: Record<Method, State> = {
  number: {
    method: 'number',
    value: '1091',
    named: null,
    opts: {style: 'currency', currency: 'USD'}
  },
  dateTime: {
    method: 'dateTime',
    date: nowISO(),
    named: null,
    opts: {dateStyle: 'long', timeStyle: 'short'}
  },
  dateTimeRange: {
    method: 'dateTimeRange',
    start: nowISO(),
    end: nowISO(3 * 24 * 60 * 60 * 1000),
    named: null,
    opts: {dateStyle: 'medium'}
  },
  relativeTime: {
    method: 'relativeTime',
    date: nowISO(-3 * 60 * 60 * 1000),
    now: nowISO(),
    opts: {numeric: 'auto', style: 'long'}
  },
  list: {
    method: 'list',
    items: 'apples, oranges, bananas',
    named: null,
    opts: {type: 'conjunction', style: 'long'}
  }
};

function nowISO(offsetMs = 0): string {
  return new Date(Date.now() + offsetMs).toISOString().slice(0, 16);
}

export function Explorer() {
  const [method, setMethod] = useState<Method>('number');
  const [states, setStates] = useState<Record<Method, State>>(defaultState);
  const [selectedLocales, setSelectedLocales] = useState<string[]>([
    ...routing.locales
  ]);

  const state = states[method];
  const update = (next: State) => setStates((s) => ({...s, [method]: next}));

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-7">
        <Header
          method={method}
          onMethod={setMethod}
          locales={selectedLocales}
          onLocales={setSelectedLocales}
        />
        <MethodBody state={state} update={update} />
      </div>
      <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <OutputPanel state={state} locales={selectedLocales} />
        <CodePanel state={state} />
      </div>
    </div>
  );
}

function Header({
  method,
  onMethod,
  locales,
  onLocales
}: {
  method: Method;
  onMethod: (m: Method) => void;
  locales: string[];
  onLocales: (l: string[]) => void;
}) {
  return (
    <div className="space-y-5">
      <Field label="Method">
        <Select value={method} onValueChange={(v) => onMethod(v as Method)}>
          <SelectTrigger className="w-full font-mono">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(METHOD_LABEL) as Method[]).map((m) => (
              <SelectItem key={m} value={m} className="font-mono">
                {METHOD_LABEL[m]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Locales">
        <LocalePicker value={locales} onChange={onLocales} />
      </Field>
    </div>
  );
}

function MethodBody({
  state,
  update
}: {
  state: State;
  update: (s: State) => void;
}) {
  switch (state.method) {
    case 'number':
      return <NumberBody state={state} update={update} />;
    case 'dateTime':
      return <DateTimeBody state={state} update={update} />;
    case 'dateTimeRange':
      return <DateTimeRangeBody state={state} update={update} />;
    case 'relativeTime':
      return <RelativeTimeBody state={state} update={update} />;
    case 'list':
      return <ListBody state={state} update={update} />;
  }
}

/* ─── Number ─────────────────────────────────────────────────────────── */

function NumberBody({
  state,
  update
}: {
  state: Extract<State, {method: 'number'}>;
  update: (s: State) => void;
}) {
  return (
    <div className="space-y-6">
      <InputRow>
        <Field label="Value">
          <Input
            value={state.value}
            onChange={(e) => update({...state, value: e.target.value})}
            inputMode="decimal"
          />
        </Field>
        <NamedFormatPicker
          options={Object.keys(registry.number)}
          value={state.named}
          onChange={(named) => update({...state, named})}
        />
      </InputRow>
      <Options disabled={state.named !== null}>
        <OptToggle
          name="style"
          opts={state.opts}
          field="style"
          defaultVal="decimal"
          update={(o) => update({...state, opts: o})}
        >
          {(v, set) => (
            <ShadSelect
              value={v ?? 'decimal'}
              onChange={(x) => set(x as NumberOpts['style'])}
              options={['decimal', 'currency', 'percent', 'unit']}
            />
          )}
        </OptToggle>
        <OptToggle
          name="currency"
          opts={state.opts}
          field="currency"
          defaultVal="USD"
          update={(o) => update({...state, opts: o})}
        >
          {(v, set) => (
            <ShadSelect
              value={v ?? 'USD'}
              onChange={set}
              options={['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'BRL', 'INR']}
            />
          )}
        </OptToggle>
        <OptToggle
          name="currencyDisplay"
          opts={state.opts}
          field="currencyDisplay"
          defaultVal="symbol"
          update={(o) => update({...state, opts: o})}
        >
          {(v, set) => (
            <ShadSelect
              value={v ?? 'symbol'}
              onChange={(x) => set(x as NumberOpts['currencyDisplay'])}
              options={['symbol', 'narrowSymbol', 'code', 'name']}
            />
          )}
        </OptToggle>
        <OptToggle
          name="currencySign"
          opts={state.opts}
          field="currencySign"
          defaultVal="standard"
          update={(o) => update({...state, opts: o})}
        >
          {(v, set) => (
            <ShadSelect
              value={v ?? 'standard'}
              onChange={(x) => set(x as NumberOpts['currencySign'])}
              options={['standard', 'accounting']}
            />
          )}
        </OptToggle>
        <OptToggle
          name="signDisplay"
          opts={state.opts}
          field="signDisplay"
          defaultVal="auto"
          update={(o) => update({...state, opts: o})}
        >
          {(v, set) => (
            <ShadSelect
              value={v ?? 'auto'}
              onChange={(x) => set(x as NumberOpts['signDisplay'])}
              options={['auto', 'always', 'never', 'exceptZero', 'negative']}
            />
          )}
        </OptToggle>
        <OptToggle
          name="notation"
          opts={state.opts}
          field="notation"
          defaultVal="standard"
          update={(o) => update({...state, opts: o})}
        >
          {(v, set) => (
            <ShadSelect
              value={v ?? 'standard'}
              onChange={(x) => set(x as NumberOpts['notation'])}
              options={['standard', 'scientific', 'engineering', 'compact']}
            />
          )}
        </OptToggle>
        <OptToggle
          name="useGrouping"
          opts={state.opts}
          field="useGrouping"
          defaultVal={true}
          update={(o) => update({...state, opts: o})}
        >
          {(v, set) => (
            <ShadSelect
              value={String(v ?? true)}
              onChange={(x) => set(x === 'true')}
              options={['true', 'false']}
            />
          )}
        </OptToggle>
        <OptToggle
          name="minimumFractionDigits"
          opts={state.opts}
          field="minimumFractionDigits"
          defaultVal={0}
          update={(o) => update({...state, opts: o})}
        >
          {(v, set) => (
            <NumInput value={v ?? 0} onChange={set} min={0} max={20} />
          )}
        </OptToggle>
        <OptToggle
          name="maximumFractionDigits"
          opts={state.opts}
          field="maximumFractionDigits"
          defaultVal={2}
          update={(o) => update({...state, opts: o})}
        >
          {(v, set) => (
            <NumInput value={v ?? 2} onChange={set} min={0} max={20} />
          )}
        </OptToggle>
        <OptToggle
          name="minimumIntegerDigits"
          opts={state.opts}
          field="minimumIntegerDigits"
          defaultVal={1}
          update={(o) => update({...state, opts: o})}
        >
          {(v, set) => (
            <NumInput value={v ?? 1} onChange={set} min={1} max={21} />
          )}
        </OptToggle>
      </Options>
    </div>
  );
}

/* ─── DateTime ──────────────────────────────────────────────────────── */

function DateTimeBody({
  state,
  update
}: {
  state: Extract<State, {method: 'dateTime'}>;
  update: (s: State) => void;
}) {
  return (
    <div className="space-y-6">
      <InputRow>
        <Field label="Date">
          <Input
            type="datetime-local"
            value={state.date}
            onChange={(e) => update({...state, date: e.target.value})}
          />
        </Field>
        <NamedFormatPicker
          options={Object.keys(registry.dateTime)}
          value={state.named}
          onChange={(named) => update({...state, named})}
        />
      </InputRow>
      <DateTimeOptions
        opts={state.opts}
        disabled={state.named !== null}
        update={(o) => update({...state, opts: o})}
      />
    </div>
  );
}

function DateTimeRangeBody({
  state,
  update
}: {
  state: Extract<State, {method: 'dateTimeRange'}>;
  update: (s: State) => void;
}) {
  return (
    <div className="space-y-6">
      <InputRow>
        <Field label="Start">
          <Input
            type="datetime-local"
            value={state.start}
            onChange={(e) => update({...state, start: e.target.value})}
          />
        </Field>
        <Field label="End">
          <Input
            type="datetime-local"
            value={state.end}
            onChange={(e) => update({...state, end: e.target.value})}
          />
        </Field>
        <NamedFormatPicker
          options={Object.keys(registry.dateTime)}
          value={state.named}
          onChange={(named) => update({...state, named})}
        />
      </InputRow>
      <DateTimeOptions
        opts={state.opts}
        disabled={state.named !== null}
        update={(o) => update({...state, opts: o})}
      />
    </div>
  );
}

function DateTimeOptions({
  opts,
  disabled,
  update
}: {
  opts: DateTimeOpts;
  disabled: boolean;
  update: (o: DateTimeOpts) => void;
}) {
  return (
    <Options disabled={disabled}>
      <OptToggle
        name="dateStyle"
        opts={opts}
        field="dateStyle"
        defaultVal="medium"
        update={update}
      >
        {(v, set) => (
          <ShadSelect
            value={v ?? 'medium'}
            onChange={(x) => set(x as DateTimeOpts['dateStyle'])}
            options={['full', 'long', 'medium', 'short']}
          />
        )}
      </OptToggle>
      <OptToggle
        name="timeStyle"
        opts={opts}
        field="timeStyle"
        defaultVal="short"
        update={update}
      >
        {(v, set) => (
          <ShadSelect
            value={v ?? 'short'}
            onChange={(x) => set(x as DateTimeOpts['timeStyle'])}
            options={['full', 'long', 'medium', 'short']}
          />
        )}
      </OptToggle>
      <OptToggle
        name="weekday"
        opts={opts}
        field="weekday"
        defaultVal="long"
        update={update}
      >
        {(v, set) => (
          <ShadSelect
            value={v ?? 'long'}
            onChange={(x) => set(x as DateTimeOpts['weekday'])}
            options={['long', 'short', 'narrow']}
          />
        )}
      </OptToggle>
      <OptToggle
        name="year"
        opts={opts}
        field="year"
        defaultVal="numeric"
        update={update}
      >
        {(v, set) => (
          <ShadSelect
            value={v ?? 'numeric'}
            onChange={(x) => set(x as DateTimeOpts['year'])}
            options={['numeric', '2-digit']}
          />
        )}
      </OptToggle>
      <OptToggle
        name="month"
        opts={opts}
        field="month"
        defaultVal="long"
        update={update}
      >
        {(v, set) => (
          <ShadSelect
            value={v ?? 'long'}
            onChange={(x) => set(x as DateTimeOpts['month'])}
            options={['numeric', '2-digit', 'long', 'short', 'narrow']}
          />
        )}
      </OptToggle>
      <OptToggle
        name="day"
        opts={opts}
        field="day"
        defaultVal="numeric"
        update={update}
      >
        {(v, set) => (
          <ShadSelect
            value={v ?? 'numeric'}
            onChange={(x) => set(x as DateTimeOpts['day'])}
            options={['numeric', '2-digit']}
          />
        )}
      </OptToggle>
      <OptToggle
        name="hour12"
        opts={opts}
        field="hour12"
        defaultVal={true}
        update={update}
      >
        {(v, set) => (
          <ShadSelect
            value={String(v ?? true)}
            onChange={(x) => set(x === 'true')}
            options={['true', 'false']}
          />
        )}
      </OptToggle>
      <OptToggle
        name="timeZoneName"
        opts={opts}
        field="timeZoneName"
        defaultVal="short"
        update={update}
      >
        {(v, set) => (
          <ShadSelect
            value={v ?? 'short'}
            onChange={(x) => set(x as DateTimeOpts['timeZoneName'])}
            options={['short', 'long']}
          />
        )}
      </OptToggle>
      <OptToggle
        name="timeZone"
        opts={opts}
        field="timeZone"
        defaultVal="UTC"
        update={update}
      >
        {(v, set) => (
          <ShadSelect
            value={v ?? 'UTC'}
            onChange={set}
            options={[
              'UTC',
              'America/New_York',
              'Europe/Berlin',
              'Asia/Tokyo',
              'Australia/Sydney'
            ]}
          />
        )}
      </OptToggle>
    </Options>
  );
}

/* ─── Relative Time ─────────────────────────────────────────────────── */

function RelativeTimeBody({
  state,
  update
}: {
  state: Extract<State, {method: 'relativeTime'}>;
  update: (s: State) => void;
}) {
  return (
    <div className="space-y-6">
      <InputRow>
        <Field label="Date">
          <Input
            type="datetime-local"
            value={state.date}
            onChange={(e) => update({...state, date: e.target.value})}
          />
        </Field>
        <Field label="Now (reference)">
          <Input
            type="datetime-local"
            value={state.now}
            onChange={(e) => update({...state, now: e.target.value})}
          />
        </Field>
      </InputRow>
      <Options disabled={false}>
        <OptToggle
          name="unit"
          opts={state.opts}
          field="unit"
          defaultVal="hour"
          update={(o) => update({...state, opts: o})}
        >
          {(v, set) => (
            <ShadSelect
              value={v ?? 'hour'}
              onChange={(x) => set(x as RelativeTimeOpts['unit'])}
              options={[
                'second',
                'minute',
                'hour',
                'day',
                'week',
                'month',
                'quarter',
                'year'
              ]}
            />
          )}
        </OptToggle>
        <OptToggle
          name="style"
          opts={state.opts}
          field="style"
          defaultVal="long"
          update={(o) => update({...state, opts: o})}
        >
          {(v, set) => (
            <ShadSelect
              value={v ?? 'long'}
              onChange={(x) => set(x as RelativeTimeOpts['style'])}
              options={['long', 'short', 'narrow']}
            />
          )}
        </OptToggle>
        <OptToggle
          name="numeric"
          opts={state.opts}
          field="numeric"
          defaultVal="auto"
          update={(o) => update({...state, opts: o})}
        >
          {(v, set) => (
            <ShadSelect
              value={v ?? 'auto'}
              onChange={(x) => set(x as RelativeTimeOpts['numeric'])}
              options={['always', 'auto']}
            />
          )}
        </OptToggle>
      </Options>
    </div>
  );
}

/* ─── List ───────────────────────────────────────────────────────────── */

function ListBody({
  state,
  update
}: {
  state: Extract<State, {method: 'list'}>;
  update: (s: State) => void;
}) {
  return (
    <div className="space-y-6">
      <InputRow>
        <Field label="Items (comma separated)">
          <Input
            value={state.items}
            onChange={(e) => update({...state, items: e.target.value})}
          />
        </Field>
        <NamedFormatPicker
          options={Object.keys(registry.list)}
          value={state.named}
          onChange={(named) => update({...state, named})}
        />
      </InputRow>
      <Options disabled={state.named !== null}>
        <OptToggle
          name="type"
          opts={state.opts}
          field="type"
          defaultVal="conjunction"
          update={(o) => update({...state, opts: o})}
        >
          {(v, set) => (
            <ShadSelect
              value={v ?? 'conjunction'}
              onChange={(x) => set(x as ListOpts['type'])}
              options={['conjunction', 'disjunction', 'unit']}
            />
          )}
        </OptToggle>
        <OptToggle
          name="style"
          opts={state.opts}
          field="style"
          defaultVal="long"
          update={(o) => update({...state, opts: o})}
        >
          {(v, set) => (
            <ShadSelect
              value={v ?? 'long'}
              onChange={(x) => set(x as ListOpts['style'])}
              options={['long', 'short', 'narrow']}
            />
          )}
        </OptToggle>
      </Options>
    </div>
  );
}

/* ─── Output ─────────────────────────────────────────────────────────── */

function OutputPanel({state, locales}: {state: State; locales: string[]}) {
  const {settings} = useSettings();
  return (
    <section aria-labelledby="explorer-output-heading">
      <h2
        id="explorer-output-heading"
        className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
      >
        Output
      </h2>
      <div
        className="dotgrid divide-y divide-border border border-border"
        aria-live={settings.announceOutput ? 'polite' : 'off'}
        aria-atomic="true"
      >
        {locales.map((loc) => (
          <OutputRow key={loc} locale={loc} state={state} />
        ))}
      </div>
    </section>
  );
}

function OutputRow({locale, state}: {locale: string; state: State}) {
  const messages = useMessages();
  return (
    <div className="flex flex-col gap-1.5 px-5 py-5 sm:px-6 sm:py-6">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {locale}
      </span>
      <NextIntlClientProvider
        locale={locale}
        messages={messages}
        formats={registry as Formats}
      >
        <Preview state={state} />
      </NextIntlClientProvider>
    </div>
  );
}

function Preview({state}: {state: State}) {
  const format = useFormatter();
  let rendered = '';
  try {
    switch (state.method) {
      case 'number': {
        const v = Number(state.value);
        const safe = Number.isFinite(v) ? v : 0;
        rendered = state.named
          ? format.number(safe, state.named as keyof typeof registry.number)
          : format.number(safe, state.opts);
        break;
      }
      case 'dateTime': {
        const d = new Date(state.date);
        rendered = state.named
          ? format.dateTime(d, state.named as keyof typeof registry.dateTime)
          : format.dateTime(d, state.opts);
        break;
      }
      case 'dateTimeRange': {
        const s = new Date(state.start);
        const e = new Date(state.end);
        rendered = state.named
          ? format.dateTimeRange(
              s,
              e,
              state.named as keyof typeof registry.dateTime
            )
          : format.dateTimeRange(s, e, state.opts);
        break;
      }
      case 'relativeTime': {
        const d = new Date(state.date);
        const now = new Date(state.now);
        rendered = format.relativeTime(d, {now, ...state.opts});
        break;
      }
      case 'list': {
        const items = state.items
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        rendered = state.named
          ? format.list(items, state.named as keyof typeof registry.list)
          : format.list(items, state.opts);
        break;
      }
    }
  } catch (err) {
    rendered = err instanceof Error ? err.message : 'Error';
  }
  return (
    <span className="break-words text-2xl font-semibold leading-tight text-foreground tabular-nums sm:text-[28px]">
      {rendered}
    </span>
  );
}

function PanelHeading({children}: {children: React.ReactNode}) {
  return (
    <h2 className="mb-3 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </h2>
  );
}

/* ─── Code Panel ─────────────────────────────────────────────────────── */

function CodePanel({state}: {state: State}) {
  const code = useMemo(() => generateCode(state), [state]);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Code
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
            · demo.tsx
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              setCopied(true);
              timeoutRef.current = setTimeout(() => {
                setCopied(false);
                timeoutRef.current = null;
              }, 1500);
            } catch {
              /* noop */
            }
          }}
          className="gap-1.5"
        >
          {copied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <CodeBlock code={code} lang="tsx" />
    </section>
  );
}

function generateCode(state: State): string {
  function fmtOpts(o: object) {
    return JSON.stringify(o, null, 2).replace(/\n/g, '\n  ');
  }
  let call = '';
  switch (state.method) {
    case 'number': {
      const arg = state.named
        ? `'${state.named}'`
        : Object.keys(state.opts).length
          ? fmtOpts(state.opts)
          : '';
      call = `format.number(${state.value}${arg ? `, ${arg}` : ''})`;
      break;
    }
    case 'dateTime': {
      const arg = state.named
        ? `'${state.named}'`
        : Object.keys(state.opts).length
          ? fmtOpts(state.opts)
          : '';
      call = `format.dateTime(new Date('${state.date}')${arg ? `, ${arg}` : ''})`;
      break;
    }
    case 'dateTimeRange': {
      const arg = state.named
        ? `'${state.named}'`
        : Object.keys(state.opts).length
          ? fmtOpts(state.opts)
          : '';
      call = `format.dateTimeRange(new Date('${state.start}'), new Date('${state.end}')${
        arg ? `, ${arg}` : ''
      })`;
      break;
    }
    case 'relativeTime': {
      const entries = [`now: new Date('${state.now}')`];
      for (const [k, v] of Object.entries(state.opts)) {
        entries.push(`${k}: ${JSON.stringify(v)}`);
      }
      call = `format.relativeTime(new Date('${state.date}'), {${entries.join(', ')}})`;
      break;
    }
    case 'list': {
      const arr = `[${state.items
        .split(',')
        .map((s) => `'${s.trim()}'`)
        .join(', ')}]`;
      const arg = state.named
        ? `'${state.named}'`
        : Object.keys(state.opts).length
          ? fmtOpts(state.opts)
          : '';
      call = `format.list(${arr}${arg ? `, ${arg}` : ''})`;
      break;
    }
  }
  return `import {useFormatter} from 'next-intl';

export function Demo() {
  const format = useFormatter();
  return <p>{${call}}</p>;
}`;
}

/* ─── Primitives ─────────────────────────────────────────────────────── */

function Field({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function InputRow({children}: {children: React.ReactNode}) {
  return <div className="flex flex-col gap-5">{children}</div>;
}

function NamedFormatPicker({
  options,
  value,
  onChange
}: {
  options: string[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <Field label="Named format (i18n/formats.ts)">
      <div className="flex flex-wrap gap-1.5">
        <PickerChip
          label="inline"
          active={value === null}
          onClick={() => onChange(null)}
        />
        {options.map((opt) => (
          <PickerChip
            key={opt}
            label={opt}
            active={value === opt}
            onClick={() => onChange(opt)}
          />
        ))}
      </div>
    </Field>
  );
}

function PickerChip({
  label,
  active,
  onClick,
  ariaLabel
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  ariaLabel?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      data-active={active || undefined}
      className="font-mono text-xs text-muted-foreground data-[active]:border-primary/50 data-[active]:bg-primary/10 data-[active]:text-foreground data-[active]:hover:bg-primary/15"
    >
      {label}
    </Button>
  );
}

const LOCALE_OPTIONS = [
  ...routing.locales,
  'fr',
  'es',
  'ja',
  'ar',
  'zh-CN',
  'pt-BR'
];

function LocalePicker({
  value,
  onChange
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(loc: string) {
    if (value.includes(loc)) {
      if (value.length === 1) return;
      onChange(value.filter((v) => v !== loc));
    } else {
      onChange([...value, loc]);
    }
  }
  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Preview locales"
    >
      {LOCALE_OPTIONS.map((loc) => (
        <PickerChip
          key={loc}
          label={loc}
          active={value.includes(loc)}
          onClick={() => toggle(loc)}
          ariaLabel={`${loc} locale${value.includes(loc) ? ' (selected)' : ''}`}
        />
      ))}
    </div>
  );
}

function ShadSelect({
  value,
  onChange,
  options,
  disabled
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function NumInput({
  value,
  onChange,
  min,
  max
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <Input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) => {
        const n = Number(e.target.value);
        if (Number.isFinite(n)) onChange(n);
      }}
    />
  );
}

function Options({
  children,
  disabled
}: {
  children: React.ReactNode;
  disabled: boolean;
}) {
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <PanelHeading>Options</PanelHeading>
        {disabled && (
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            disabled · using named format
          </span>
        )}
      </div>
      <div
        data-disabled={disabled || undefined}
        className="grid grid-cols-1 gap-3 sm:[grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] data-[disabled]:pointer-events-none data-[disabled]:opacity-40"
      >
        {children}
      </div>
    </section>
  );
}

function OptToggle<O extends object, K extends keyof O>({
  name,
  opts,
  field,
  defaultVal,
  update,
  children
}: {
  name: string;
  opts: O;
  field: K;
  defaultVal: O[K];
  update: (o: O) => void;
  children: (v: O[K] | undefined, set: (v: O[K]) => void) => React.ReactNode;
}) {
  const checked = opts[field] !== undefined;
  function toggle() {
    if (checked) {
      const next = {...opts};
      delete next[field];
      update(next);
    } else {
      update({...opts, [field]: defaultVal});
    }
  }
  function set(v: O[K]) {
    update({...opts, [field]: v});
  }
  return (
    <div
      data-checked={checked || undefined}
      className="flex flex-col gap-3 rounded-md border border-border bg-background p-3.5 transition-colors data-[checked]:border-primary/40 data-[checked]:ring-1 data-[checked]:ring-primary/20"
    >
      <div className="flex items-center gap-2">
        <Checkbox
          id={`opt-${name}`}
          checked={checked}
          onCheckedChange={toggle}
        />
        <Label
          htmlFor={`opt-${name}`}
          className="cursor-pointer font-mono text-[12px] font-medium text-foreground"
        >
          {name}
        </Label>
      </div>
      <div
        data-disabled={!checked || undefined}
        className="data-[disabled]:pointer-events-none data-[disabled]:opacity-40"
      >
        {children(opts[field], set)}
      </div>
    </div>
  );
}
