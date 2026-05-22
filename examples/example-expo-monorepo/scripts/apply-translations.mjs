#!/usr/bin/env node
/**
 * Fill empty msgstr entries across every locale .po by asking an LLM via
 * OpenRouter to translate them.
 *
 * Pipeline (per locale):
 *   1. Parse en.po and <locale>.po; collect entries with empty msgstr.
 *   2. Chunk entries and translate in parallel via OpenRouter chat completions.
 *   3. Write filled msgstr entries back into <locale>.po immediately as each
 *      chunk completes (per-locale write mutex serialises writes).
 *
 * Usage:
 *   OPENROUTER_API_KEY=… node ./scripts/apply-translations.mjs
 *   OPENROUTER_API_KEY=… node ./scripts/apply-translations.mjs --locale de
 *
 * Env vars:
 *   OPENROUTER_API_KEY  (required)  — get one at https://openrouter.ai/keys
 *   OPENROUTER_MODEL    (optional)  — override the default model
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

// Must stay in sync with the `locales` array in scripts/extract.mjs.
const TARGET_LOCALES = ['de'];

const LANGUAGE_NAMES = {
  de: 'German'
};

const CHUNK_SIZE = 50;
const MAX_PARALLEL = 16;
const DEFAULT_MODEL = 'anthropic/claude-haiku-4.5';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const I18N_DIR = path.join(ROOT, 'messages');

function parseLocaleArg() {
  const args = process.argv.slice(2);
  const idx = args.indexOf('--locale');
  if (idx === -1) return undefined;
  const value = args[idx + 1];
  if (!value || !TARGET_LOCALES.includes(value)) {
    console.error(
      `Invalid --locale. Expected one of: ${TARGET_LOCALES.join(', ')}`
    );
    process.exit(1);
  }
  return value;
}

function unescapePo(s) {
  return s
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

function escapePo(s) {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\\t/g, '\\t');
}

function parsePo(filePath) {
  const text = fs.readFileSync(filePath, 'utf-8');
  const entries = [];
  const lines = text.split('\n');
  let currentMsgid;
  let currentMsgstr;
  let mode;

  const flush = () => {
    if (
      currentMsgid !== undefined &&
      currentMsgstr !== undefined &&
      currentMsgid !== ''
    ) {
      entries.push({msgid: currentMsgid, msgstr: currentMsgstr});
    }
    currentMsgid = undefined;
    currentMsgstr = undefined;
    mode = undefined;
  };

  for (const raw of lines) {
    const line = raw.replace(/\r$/, '');
    if (line.startsWith('#') || line === '') {
      if (line === '') flush();
      continue;
    }
    const msgidMatch = line.match(/^msgid\s+"(.*)"$/);
    if (msgidMatch) {
      flush();
      currentMsgid = unescapePo(msgidMatch[1] ?? '');
      mode = 'msgid';
      continue;
    }
    const msgstrMatch = line.match(/^msgstr\s+"(.*)"$/);
    if (msgstrMatch) {
      currentMsgstr = unescapePo(msgstrMatch[1] ?? '');
      mode = 'msgstr';
      continue;
    }
    const contMatch = line.match(/^"(.*)"$/);
    if (contMatch) {
      const piece = unescapePo(contMatch[1] ?? '');
      if (mode === 'msgid') currentMsgid = (currentMsgid ?? '') + piece;
      else if (mode === 'msgstr')
        currentMsgstr = (currentMsgstr ?? '') + piece;
    }
  }
  flush();
  return entries;
}

function findEmptyEntries(locale) {
  const enPath = path.join(I18N_DIR, 'en.po');
  const localePath = path.join(I18N_DIR, `${locale}.po`);
  if (!fs.existsSync(localePath)) return [];
  const enByMsgid = new Map();
  for (const e of parsePo(enPath)) enByMsgid.set(e.msgid, e.msgstr);
  const out = [];
  for (const e of parsePo(localePath)) {
    if (e.msgstr !== '') continue;
    const english = enByMsgid.get(e.msgid);
    if (english === undefined || english === '') continue;
    out.push({msgid: e.msgid, english});
  }
  return out;
}

function buildPrompt(locale, chunk) {
  const jsonl = chunk.map((e) => JSON.stringify(e)).join('\n');
  const language = LANGUAGE_NAMES[locale];
  return [
    `You are translating UI strings from English to ${language}.`,
    '',
    'Guidelines:',
    `- Use natural, idiomatic ${language}.`,
    '- Preserve placeholders like {name}, {count}, %s, %d, <strong>…</strong> exactly.',
    '- Preserve leading/trailing whitespace and punctuation.',
    '- Return ONLY a JSON object mapping each msgid to its translation. No commentary.',
    '',
    'Entries (one JSON object per line, fields: msgid, english):',
    jsonl
  ].join('\n');
}

function stripCodeFences(s) {
  const trimmed = s.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? (fenced[1]?.trim() ?? trimmed) : trimmed;
}

/**
 * Normalize a model response into a flat msgid → translation map. Handles
 * common variants: bare flat map, wrapper key with object value, wrapper key
 * with stringified-JSON value.
 */
function normalizeTranslationMap(raw) {
  if (raw === null || typeof raw !== 'object') return {};
  const obj = raw;
  const entries = Object.entries(obj);

  if (entries.every(([, v]) => typeof v === 'string')) {
    if (entries.length === 1) {
      const onlyValue = entries[0]?.[1];
      if (typeof onlyValue === 'string') {
        const trimmed = stripCodeFences(onlyValue);
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          try {
            const inner = JSON.parse(trimmed);
            return normalizeTranslationMap(inner);
          } catch {
            // Fall through and treat the single key as a real entry.
          }
        }
      }
    }
    return obj;
  }

  if (entries.length === 1 && typeof entries[0]?.[1] === 'object') {
    return normalizeTranslationMap(entries[0][1]);
  }

  const out = {};
  for (const [k, v] of entries) {
    if (typeof v === 'string') out[k] = v;
  }
  return out;
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;
if (!OPENROUTER_API_KEY) {
  console.error(
    'OPENROUTER_API_KEY env var is required. Get a key at https://openrouter.ai/keys'
  );
  process.exit(1);
}

async function runOpenRouter(prompt) {
  const body = {
    model: OPENROUTER_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are a professional UI translator. Respond with a single JSON object mapping each msgid to its translated string. Do not include commentary, explanations, or code fences.'
      },
      {role: 'user', content: prompt}
    ],
    response_format: {type: 'json_object'},
    temperature: 0
  };

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://next-intl.dev',
      'X-Title': 'next-intl example i18n'
    },
    body: JSON.stringify(body)
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(
      `OpenRouter HTTP ${response.status}: ${text.slice(0, 500)}`
    );
  }

  let envelope;
  try {
    envelope = JSON.parse(text);
  } catch (err) {
    throw new Error(
      `OpenRouter returned non-JSON: ${text.slice(0, 500)} | parse error: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  if (envelope.error) {
    throw new Error(
      `OpenRouter API error${envelope.error.code ? ` (${envelope.error.code})` : ''}: ${envelope.error.message ?? '<no message>'}`
    );
  }

  const content = envelope.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || content.trim() === '') {
    throw new Error(
      `OpenRouter response missing content: ${text.slice(0, 500)}`
    );
  }

  const cleaned = stripCodeFences(content);
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(
      `Failed to parse model JSON: ${err instanceof Error ? err.message : String(err)} | raw: ${cleaned.slice(0, 500)}`
    );
  }

  return {
    translations: normalizeTranslationMap(parsed),
    rawResponse: text
  };
}

function applyTranslations(locale, translations) {
  const poPath = path.join(I18N_DIR, `${locale}.po`);
  const lines = fs.readFileSync(poPath, 'utf-8').split('\n');
  const out = [];
  let filled = 0;
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? '';
    const msgidMatch = line.match(/^msgid\s+"(.*)"$/);
    if (!msgidMatch) {
      out.push(line);
      i++;
      continue;
    }
    const msgid = unescapePo(msgidMatch[1] ?? '');
    out.push(line);
    i++;
    const next = lines[i] ?? '';
    const msgstrMatch = next.match(/^msgstr\s+"(.*)"$/);
    if (!msgstrMatch || msgid === '') {
      out.push(next);
      i++;
      continue;
    }
    const currentMsgstr = unescapePo(msgstrMatch[1] ?? '');
    if (currentMsgstr !== '') {
      out.push(next);
      i++;
      continue;
    }
    const translation = translations[msgid];
    if (translation === undefined) {
      out.push(next);
      i++;
      continue;
    }
    out.push(`msgstr "${escapePo(translation)}"`);
    filled++;
    i++;
  }
  if (filled > 0) fs.writeFileSync(poPath, out.join('\n'), 'utf-8');
  return filled;
}

async function runJobsWithConcurrency(items, worker, limit) {
  const results = [];
  let cursor = 0;
  async function pull() {
    while (cursor < items.length) {
      const idx = cursor++;
      const job = items[idx];
      if (!job) return;
      const value = await worker(job);
      results.push(value);
    }
  }
  const runners = [];
  for (let n = 0; n < Math.min(limit, items.length); n++) {
    runners.push(pull());
  }
  await Promise.all(runners);
  return results;
}

function log(msg) {
  console.log(msg);
}

// Per-locale write mutex: chunks for the same locale serialize their PO writes
// so concurrent read-modify-write cycles cannot clobber each other.
const localeWriteLocks = new Map();

function withLocaleLock(locale, work) {
  const previous = localeWriteLocks.get(locale) ?? Promise.resolve();
  const next = previous.then(() => work());
  localeWriteLocks.set(
    locale,
    next.then(
      () => undefined,
      () => undefined
    )
  );
  return next;
}

async function main() {
  const only = parseLocaleArg();
  const locales = only ? [only] : TARGET_LOCALES;

  const jobs = [];
  const emptyByLocale = new Map();

  for (const locale of locales) {
    const empty = findEmptyEntries(locale);
    emptyByLocale.set(locale, empty.length);
    if (empty.length === 0) {
      log(`[${locale}] nothing to translate`);
      continue;
    }
    const totalChunks = Math.ceil(empty.length / CHUNK_SIZE);
    for (let i = 0; i < empty.length; i += CHUNK_SIZE) {
      jobs.push({
        locale,
        chunkIndex: i / CHUNK_SIZE,
        totalChunks,
        entries: empty.slice(i, i + CHUNK_SIZE)
      });
    }
    log(
      `[${locale}] queued ${totalChunks} chunk(s) for ${empty.length} entries`
    );
  }

  if (jobs.length === 0) {
    log('Nothing to do.');
    return;
  }

  log(
    `\n▶ Running ${jobs.length} chunk(s) via OpenRouter (model=${OPENROUTER_MODEL}, parallel=${MAX_PARALLEL})`
  );

  const filledByLocale = new Map();
  for (const locale of locales) filledByLocale.set(locale, 0);

  const DEBUG_DIR = '/tmp/apply-translations-debug';
  fs.mkdirSync(DEBUG_DIR, {recursive: true});

  let completed = 0;
  await runJobsWithConcurrency(
    jobs,
    async (job) => {
      const prompt = buildPrompt(job.locale, job.entries);
      try {
        const {translations, rawResponse} = await runOpenRouter(prompt);
        const requestedIds = new Set(job.entries.map((e) => e.msgid));
        const returnedKeys = Object.keys(translations);
        const matchedKeys = returnedKeys.filter((k) => requestedIds.has(k));
        const filled = await withLocaleLock(job.locale, () =>
          applyTranslations(job.locale, translations)
        );
        filledByLocale.set(
          job.locale,
          (filledByLocale.get(job.locale) ?? 0) + filled
        );
        completed++;
        log(
          `  ✓ [${job.locale}] chunk ${job.chunkIndex + 1}/${job.totalChunks} → model returned ${returnedKeys.length} keys (${matchedKeys.length} matched), wrote ${filled} entries (${completed}/${jobs.length} total)`
        );
        if (filled === 0 && job.entries.length > 0) {
          const debugPath = `${DEBUG_DIR}/${job.locale}-chunk${job.chunkIndex + 1}.json`;
          fs.writeFileSync(
            debugPath,
            JSON.stringify(
              {
                requestedMsgids: Array.from(requestedIds).slice(0, 5),
                returnedKeysSample: returnedKeys.slice(0, 5),
                returnedValuesSample: returnedKeys
                  .slice(0, 3)
                  .map((k) => ({key: k, value: translations[k]})),
                rawResponsePreview: rawResponse.slice(0, 2000)
              },
              null,
              2
            ),
            'utf-8'
          );
          log(`    ↳ wrote debug snapshot: ${debugPath}`);
        }
      } catch (err) {
        completed++;
        log(
          `  ✗ [${job.locale}] chunk ${job.chunkIndex + 1}/${job.totalChunks} FAILED: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    },
    MAX_PARALLEL
  );

  log('\n▶ Per-locale totals:');
  for (const locale of locales) {
    const total = emptyByLocale.get(locale) ?? 0;
    if (total === 0) continue;
    log(`  [${locale}] filled ${filledByLocale.get(locale) ?? 0}/${total}`);
  }

  log('\n✓ Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
