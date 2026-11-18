import fs from 'fs/promises';
import path from 'path';
import UserError from '../UserError.js';
import type {Locale, MessagesPathEntry} from '../types.js';

const TOKEN_NAMES = ['locale', 'code', 'namespace'] as const;
type TokenName = (typeof TOKEN_NAMES)[number];

// Each path segment is either a fixed name or captures exactly one token,
// optionally wrapped in literal text (`{locale}.lproj`). `parseSegment` rejects
// segments with more than one token, so matching never has to disambiguate
// two captures within one name.
type Segment =
  | {kind: 'literal'; text: string}
  | {kind: 'capture'; name: TokenName; prefix: string; suffix: string};

export type ParsedTemplate = {
  /** The string the user wrote, for error messages. */
  source: string;
  /** Filesystem root the template starts at (`/`, `C:/`), or `''` when relative. */
  root: string;
  segments: Array<Segment>;
};

/**
 * A `source` path must not carry a locale placeholder (it is the source
 * locale's file), a `targets` template must, a standalone template falls back
 * to one file per locale in a folder when it has none, and a `shared` template
 * names the one file every locale lives in.
 */
type TemplateRole = 'standalone' | 'source' | 'targets' | 'shared';

export type ParsedPathEntry =
  | {kind: 'template'; template: ParsedTemplate}
  | {kind: 'split'; source: ParsedTemplate; targets: ParsedTemplate};

export type TemplateMatch = {
  /**
   * Mapped back through `codes` when the template captures `{code}`. Absent
   * for a split entry's source path.
   */
  locale: Locale | undefined;
  namespace: string | undefined;
  filePath: string;
};

export type LocaleCodes = {
  toCode(locale: Locale): string;
  toLocale(code: string): Locale;
};

/**
 * Unmapped values pass through unchanged in both directions. Two locales
 * can't share a code, since a file must map back to a single locale.
 */
export function createLocaleCodes(
  codes: Record<Locale, string> = {},
  knownLocales?: ReadonlyArray<Locale>
): LocaleCodes {
  function toCode(locale: Locale): string {
    return codes[locale] ?? locale;
  }

  const inverse = new Map<string, Locale>();
  for (const [locale, code] of Object.entries(codes)) {
    const existing = inverse.get(code);
    if (existing !== undefined) {
      throw new UserError(
        `messages.codes maps "${existing}" and "${locale}" to the same code "${code}"`,
        {
          hint: 'Give each locale its own code, so a file maps back to a single locale.'
        }
      );
    }
    // A code that is another locale's path form shadows that locale's files.
    // With the locales spelled out, the shadowed one can be named here. Under
    // `locales: 'infer'`, a code that merely reads like a locale is no reason
    // to refuse the mapping, since most are the only thing naming their files.
    if (code !== locale && knownLocales) {
      const shadowed = knownLocales.find(
        (other) => other !== locale && toCode(other) === code
      );
      if (shadowed !== undefined) {
        throw new UserError(
          `messages.codes maps "${locale}" to "${code}", which is how "${shadowed}" is already written`,
          {
            hint: 'Two locales resolving to one file makes a match ambiguous, give this locale a code of its own.'
          }
        );
      }
    }
    inverse.set(code, locale);
  }
  return {
    toCode,
    toLocale: (code) => inverse.get(code) ?? code
  };
}

/**
 * With a shared-file codec, an entry names one file that holds every locale,
 * so a locale placeholder or a split entry contradicts the layout.
 */
export function parsePathEntry(
  entry: MessagesPathEntry,
  codecKind: 'separate' | 'shared' = 'separate'
): ParsedPathEntry {
  if (typeof entry === 'string') {
    return {
      kind: 'template',
      template: parseTemplate(
        entry,
        codecKind === 'shared' ? 'shared' : 'standalone'
      )
    };
  }
  if (codecKind === 'shared') {
    throw new UserError(
      "messages.path can't split source and targets with a shared-file format",
      {
        hint: 'The shared file holds every locale. Point messages.path at the file itself, without a placeholder.'
      }
    );
  }
  const source = parseTemplate(entry.source, 'source');
  const targets = parseTemplate(entry.targets, 'targets');
  if (hasToken(source, 'namespace') !== hasToken(targets, 'namespace')) {
    throw new UserError(
      `{namespace} must appear in both "${entry.source}" and "${entry.targets}", or in neither`,
      {
        hint: 'Use the same namespaces for the source path and the targets template, so messages route to matching files.'
      }
    );
  }
  return {kind: 'split', source, targets};
}

export function hasToken(template: ParsedTemplate, name: TokenName): boolean {
  return template.segments.some(
    (segment) => segment.kind === 'capture' && segment.name === name
  );
}

/**
 * A standalone path without a locale placeholder is treated as if it ended
 * in `/{locale}`, i.e. a folder with one file per locale.
 */
function parseTemplate(source: string, role: TemplateRole): ParsedTemplate {
  // Normalize Windows separators and split off the filesystem root, so the
  // remainder splits cleanly on `/` on every platform
  const normalized = source.replaceAll('\\', '/');
  const root = /^([A-Za-z]:)?\/+/.exec(normalized)?.[0] ?? '';

  const segments: Array<Segment> = [];
  const seen = new Set<TokenName>();

  for (const segmentText of normalized.slice(root.length).split('/')) {
    if (segmentText === '') continue;
    const segment = parseSegment(segmentText, source);
    segments.push(segment);
    if (segment.kind !== 'capture') continue;
    if (seen.has(segment.name)) {
      throw new UserError(
        `messages.path "${source}" uses {${segment.name}} more than once`,
        {
          hint: 'Use each token once, so a captured value maps back to a single path.'
        }
      );
    }
    if (
      (segment.name === 'locale' && seen.has('code')) ||
      (segment.name === 'code' && seen.has('locale'))
    ) {
      throw new UserError(
        `messages.path "${source}" uses both {locale} and {code}`,
        {
          hint: 'Use one of the two, {code} is {locale} mapped through messages.codes.'
        }
      );
    }
    seen.add(segment.name);
  }

  const hasLocaleAxis = seen.has('locale') || seen.has('code');

  if (role === 'shared' && hasLocaleAxis) {
    throw new UserError(
      `messages.path "${source}" uses a locale placeholder with a shared-file format`,
      {
        hint: 'The shared file holds every locale. Point messages.path at the file itself, without a placeholder.'
      }
    );
  }

  if (role === 'source' && hasLocaleAxis) {
    throw new UserError(
      `The source path "${source}" must not contain {locale} or {code}`,
      {
        hint: 'The source path is the source locale’s file, the placeholder belongs in `targets`.'
      }
    );
  }

  if (role === 'targets' && !hasLocaleAxis) {
    throw new UserError(
      `The targets template "${source}" needs {locale} or {code}`,
      {hint: 'The placeholder maps each target locale to its own file.'}
    );
  }

  if (role === 'standalone' && seen.has('namespace') && !hasLocaleAxis) {
    throw new UserError(
      `messages.path "${source}" captures {namespace} but no locale`,
      {
        hint: 'Add a {locale} or {code} token so each messages file maps to a specific locale.'
      }
    );
  }

  if (role === 'standalone' && !hasLocaleAxis) {
    segments.push({kind: 'capture', name: 'locale', prefix: '', suffix: ''});
  }

  return {source, root, segments};
}

function parseSegment(text: string, fullSource: string): Segment {
  let capture: {name: TokenName; prefix: string} | null = null;
  let pending = '';
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (ch === '}') {
      throw new UserError(`Unexpected "}" in messages.path "${fullSource}"`, {
        hint: 'Use "{token}" to capture a value, or remove the brace if you meant a literal.'
      });
    }

    if (ch !== '{') {
      pending += ch;
      i += 1;
      continue;
    }

    const close = text.indexOf('}', i);
    if (close === -1) {
      throw new UserError(`Unbalanced "{" in messages.path "${fullSource}"`, {
        hint: 'Each "{" needs a matching "}", e.g. {locale} or {namespace}.'
      });
    }

    const name = text.slice(i + 1, close);
    if (!TOKEN_NAMES.includes(name as TokenName)) {
      throw new UserError(
        `Unknown token "{${name}}" in messages.path "${fullSource}"`,
        {
          hint: `Use one of the supported tokens (${TOKEN_NAMES.map((n) => `{${n}}`).join(', ')}), or remove the placeholder if you meant a literal path.`
        }
      );
    }

    if (capture) {
      throw new UserError(
        `Multiple tokens in one path segment ("${text}") in messages.path "${fullSource}" are not supported`,
        {
          hint: 'Split the captures across path segments, e.g. "{namespace}/{locale}" instead of "{namespace}_{locale}".'
        }
      );
    }
    capture = {name: name as TokenName, prefix: pending};
    pending = '';
    i = close + 1;
  }

  if (!capture) return {kind: 'literal', text};
  return {
    kind: 'capture',
    name: capture.name,
    prefix: capture.prefix,
    suffix: pending
  };
}

const identityCodes = createLocaleCodes();

/** Resolves a template to a file path, relative templates against `rootDir`. */
export function substituteTemplate(
  template: ParsedTemplate,
  vars: {locale: Locale; namespace: string | undefined},
  rootDir: string,
  extension: string,
  localeCodes: LocaleCodes = identityCodes
): string {
  const parts = template.segments.map((segment) => {
    if (segment.kind === 'literal') return segment.text;
    const value =
      segment.name === 'locale'
        ? vars.locale
        : segment.name === 'code'
          ? localeCodes.toCode(vars.locale)
          : vars.namespace;
    if (value === undefined) {
      throw new Error(
        `Cannot substitute {${segment.name}} in template "${template.source}" without a value`
      );
    }
    return `${segment.prefix}${value}${segment.suffix}`;
  });
  return path.resolve(template.root || rootDir, ...parts) + extension;
}

/**
 * Every file under `rootDir` that matches the template. Missing directories
 * yield no matches, the caller decides whether that's an error.
 */
export async function discoverFiles(input: {
  template: ParsedTemplate;
  rootDir: string;
  extension: string;
  localeCodes?: LocaleCodes;
}): Promise<Array<TemplateMatch>> {
  const {template, rootDir, extension, localeCodes = identityCodes} = input;
  const results: Array<TemplateMatch> = [];
  await walk(
    path.resolve(template.root || rootDir),
    template.segments,
    0,
    {},
    results,
    extension,
    localeCodes
  );
  return results;
}

async function walk(
  currentDir: string,
  segments: Array<Segment>,
  i: number,
  captures: {locale?: Locale; namespace?: string},
  results: Array<TemplateMatch>,
  extension: string,
  localeCodes: LocaleCodes
): Promise<void> {
  const segment = segments[i];
  const isLast = i === segments.length - 1;

  if (segment.kind === 'literal') {
    if (isLast) {
      const filePath = path.join(currentDir, `${segment.text}${extension}`);
      if (await isFile(filePath)) {
        results.push({
          locale: captures.locale,
          namespace: captures.namespace,
          filePath
        });
      }
      return;
    }
    await walk(
      path.join(currentDir, segment.text),
      segments,
      i + 1,
      captures,
      results,
      extension,
      localeCodes
    );
    return;
  }

  for (const entry of await safeReaddir(currentDir)) {
    if (isLast) {
      if (!entry.isFile() && !entry.isSymbolicLink()) continue;
      if (!entry.name.endsWith(extension)) continue;
      const stem = entry.name.slice(0, -extension.length);
      const value = matchCapture(segment, stem);
      if (value === null) continue;
      const updated = applyCapture(captures, segment.name, value, localeCodes);
      results.push({
        locale: updated.locale,
        namespace: updated.namespace,
        filePath: path.join(currentDir, entry.name)
      });
      continue;
    }

    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
    const value = matchCapture(segment, entry.name);
    if (value === null) continue;
    await walk(
      path.join(currentDir, entry.name),
      segments,
      i + 1,
      applyCapture(captures, segment.name, value, localeCodes),
      results,
      extension,
      localeCodes
    );
  }
}

function applyCapture(
  captures: {locale?: Locale; namespace?: string},
  name: TokenName,
  value: string,
  localeCodes: LocaleCodes
): {locale?: Locale; namespace?: string} {
  if (name === 'namespace') return {...captures, namespace: value};
  return {
    ...captures,
    locale: name === 'code' ? localeCodes.toLocale(value) : value
  };
}

/** Matches `prefix<value>suffix`, returning the non-empty value or `null`. */
function matchCapture(
  segment: {prefix: string; suffix: string},
  text: string
): string | null {
  if (!text.startsWith(segment.prefix) || !text.endsWith(segment.suffix)) {
    return null;
  }
  const value = text.slice(
    segment.prefix.length,
    text.length - segment.suffix.length
  );
  return value.length > 0 ? value : null;
}

/**
 * The directory the template walks from, for errors that need to point at
 * something stable (e.g. a missing messages folder).
 */
export function resolveBaseDir(
  template: ParsedTemplate,
  rootDir: string
): string {
  const literalPrefix: Array<string> = [];
  // The last segment names the file itself, never a directory, so a fully
  // literal template (a split entry's source path) must not fold it in
  for (const segment of template.segments.slice(0, -1)) {
    if (segment.kind !== 'literal') break;
    literalPrefix.push(segment.text);
  }
  return path.resolve(template.root || rootDir, ...literalPrefix);
}

// Entries with their types in one call, so matching needs no stat per entry
async function safeReaddir(dirPath: string) {
  try {
    return await fs.readdir(dirPath, {withFileTypes: true});
  } catch (error) {
    const {code} = error as NodeJS.ErrnoException;
    if (code === 'ENOENT' || code === 'ENOTDIR') return [];
    throw error;
  }
}

async function isFile(filePath: string): Promise<boolean> {
  try {
    return (await fs.stat(filePath)).isFile();
  } catch {
    return false;
  }
}
