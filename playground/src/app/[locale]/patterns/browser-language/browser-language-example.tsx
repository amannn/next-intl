import {headers} from 'next/headers';
import {useLocale, useTranslations} from 'next-intl';
import {routing} from '@/i18n/routing';

type ParsedTag = {tag: string; quality: number};

function parseAcceptLanguage(header: string | null): ParsedTag[] {
  if (!header) return [];
  return header
    .split(',')
    .map((entry) => {
      const [tag, ...params] = entry.trim().split(';');
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      const quality = q ? Number(q.slice(2)) : 1;
      return {tag: tag.trim(), quality: Number.isFinite(quality) ? quality : 0};
    })
    .filter((t) => t.tag.length > 0)
    .sort((a, b) => b.quality - a.quality);
}

function resolveLocale(
  preferences: ParsedTag[],
  supported: ReadonlyArray<string>,
  fallback: string
): {locale: string; matched: 'exact' | 'language' | 'fallback'} {
  const supportedLower = supported.map((s) => s.toLowerCase());
  for (const {tag} of preferences) {
    const lower = tag.toLowerCase();
    const exactIdx = supportedLower.indexOf(lower);
    if (exactIdx !== -1) return {locale: supported[exactIdx], matched: 'exact'};
    const language = lower.split('-')[0];
    const langIdx = supportedLower.findIndex(
      (s) => s === language || s.startsWith(`${language}-`)
    );
    if (langIdx !== -1)
      return {locale: supported[langIdx], matched: 'language'};
  }
  return {locale: fallback, matched: 'fallback'};
}

export async function BrowserLanguageExample() {
  const hdrs = await headers();
  const acceptLanguage = hdrs.get('accept-language');
  const parsed = parseAcceptLanguage(acceptLanguage);
  const resolved = resolveLocale(
    parsed,
    routing.locales,
    routing.defaultLocale
  );
  return (
    <BrowserLanguageView
      acceptLanguage={acceptLanguage}
      parsed={parsed}
      resolved={resolved}
    />
  );
}

function BrowserLanguageView({
  acceptLanguage,
  parsed,
  resolved
}: {
  acceptLanguage: string | null;
  parsed: ParsedTag[];
  resolved: {locale: string; matched: 'exact' | 'language' | 'fallback'};
}) {
  const t = useTranslations('BrowserLanguageDemo');
  const activeLocale = useLocale();
  const matchedKey =
    resolved.matched === 'exact'
      ? 'exactMatch'
      : resolved.matched === 'language'
        ? 'languageMatch'
        : 'fallbackMatch';

  return (
    <div className="flex w-full max-w-2xl flex-col gap-5">
      <div className="space-y-1.5">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {t('acceptLanguage')}
        </div>
        <code className="block break-all rounded-md border border-border bg-background/80 px-3 py-2 text-xs text-foreground">
          {acceptLanguage ?? t('noHeader')}
        </code>
      </div>

      {parsed.length > 0 && (
        <div className="space-y-1.5">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {t('preferences')}
          </div>
          <ul className="divide-y divide-border border border-border bg-background/80">
            {parsed.map((p, i) => (
              <li
                key={`${p.tag}-${i}`}
                className="flex items-center justify-between gap-4 px-3 py-2 text-xs"
              >
                <code className="text-foreground">{p.tag}</code>
                <span className="font-mono text-muted-foreground">
                  q={p.quality}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-px bg-border">
        <Stat label={t('resolved')} value={resolved.locale} />
        <Stat label={t('matchKind')} value={t(matchedKey)} />
      </div>

      <p className="text-xs text-muted-foreground">
        {t('currentNote', {locale: activeLocale})}
      </p>
    </div>
  );
}

function Stat({label, value}: {label: string; value: string}) {
  return (
    <div className="flex flex-col gap-1 bg-background px-4 py-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span className="text-base font-semibold text-foreground">{value}</span>
    </div>
  );
}
