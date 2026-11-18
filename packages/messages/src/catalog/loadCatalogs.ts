import fs from 'fs/promises';
import path from 'path';
import UserError from '../UserError.js';
import type {ExtractorMessage, Locale, MessagesPathEntry} from '../types.js';
import {addNamespacePrefix} from './namespacePrefix.js';
import {
  type LocaleCodes,
  type ParsedPathEntry,
  type ParsedTemplate,
  createLocaleCodes,
  discoverFiles,
  parsePathEntry,
  resolveBaseDir,
  substituteTemplate
} from './pathTemplate.js';
import readCatalogFile, {
  readIfExists,
  toDecodeError
} from './readCatalogFile.js';
import type {
  Catalog,
  CatalogGroup,
  LoadedCatalogs,
  MessagesCodec,
  SeparateFileCodec,
  SharedFileCodec
} from './types.js';

export type LoadCatalogsOptions = {
  messagesPath: MessagesPathEntry | Array<MessagesPathEntry>;
  sourceLocale: Locale;
  /** Target locales, or `'infer'` to discover them from the message paths. */
  locales?: 'infer' | ReadonlyArray<Locale>;
  /** Maps locales to the codes used in file paths (`{code}`). */
  codes?: Record<Locale, string>;
  /** Relative paths resolve against it. */
  rootDir: string;
  extension: string;
  /**
   * Each catalog is decoded with its own instance, so a writer can encode a
   * file with the same instance and keep that file's round-trip state (e.g.
   * PO header metadata).
   */
  codecFactory(): MessagesCodec;
};

/** A template match with the locale resolved — split-entry source matches are bound to the source locale. */
type Match = {
  locale: Locale;
  namespace: string | undefined;
  filePath: string;
};

type Discovery = {
  entry: ParsedPathEntry;
  matches: Array<Match>;
};

/**
 * Reads every messages path and returns both views: per-group catalogs
 * (which file each message came from) and a merged catalogs view (source
 * first then each target). A locale split across groups merges into one
 * catalog; ids must be unique across groups, since on a collision the later
 * group wins. A missing target file becomes an empty catalog; a missing
 * source catalog is an error.
 */
export default async function loadCatalogs(
  options: LoadCatalogsOptions
): Promise<LoadedCatalogs> {
  const {
    messagesPath,
    sourceLocale,
    locales,
    codes,
    rootDir,
    extension,
    codecFactory
  } = options;
  // Every instance the factory creates shares the layout of this probe
  const codecKind = codecFactory().file === 'shared' ? 'shared' : 'separate';
  // Spelled-out locales let the code check name what a mapping would shadow.
  // `'infer'` leaves it undefined, since the set isn't known until the walk.
  const localeCodes = createLocaleCodes(
    codes,
    Array.isArray(locales) ? [sourceLocale, ...locales] : undefined
  );

  const entries = (
    Array.isArray(messagesPath) ? messagesPath : [messagesPath]
  ).map((entry) => parsePathEntry(entry, codecKind));

  if (codecKind === 'shared') {
    return loadSharedGroups({
      entries,
      sourceLocale,
      locales,
      rootDir,
      extension,
      localeCodes,
      codecFactory
    });
  }

  // Walk the disk for every entry — locales come out as a side-effect. A
  // split entry's source path carries no locale capture, so its matches are
  // bound to the source locale; a target file that happens to resolve to the
  // source locale is skipped, since the source path is authoritative.
  const discoveries: Array<Discovery> = await Promise.all(
    entries.map(async (entry): Promise<Discovery> => {
      if (entry.kind === 'template') {
        const matches = await discoverFiles({
          template: entry.template,
          rootDir,
          extension,
          localeCodes
        });
        return {
          entry,
          matches: matches.map((match) => ({...match, locale: match.locale!}))
        };
      }
      const [sourceMatches, targetMatches] = await Promise.all([
        discoverFiles({
          template: entry.source,
          rootDir,
          extension,
          localeCodes
        }),
        discoverFiles({
          template: entry.targets,
          rootDir,
          extension,
          localeCodes
        })
      ]);
      return {
        entry,
        matches: [
          ...sourceMatches.map((match) => ({...match, locale: sourceLocale})),
          ...targetMatches
            .filter((match) => match.locale !== sourceLocale)
            .map((match) => ({...match, locale: match.locale!}))
        ]
      };
    })
  );

  const targetLocales = resolveTargetLocales(
    discoveries.flatMap(({matches}) => matches.map((match) => match.locale)),
    sourceLocale,
    locales
  );
  const allowed = new Set([sourceLocale, ...targetLocales]);
  assertUnambiguousCodes(allowed, localeCodes);

  const groups = await buildGroups({
    discoveries,
    allowed,
    sourceLocale,
    codecFactory: codecFactory as () => SeparateFileCodec,
    rootDir,
    extension,
    localeCodes
  });

  const sourceCatalog = mergeLocale(groups, sourceLocale);
  if (!sourceCatalog) {
    throw await missingSourceError({
      entries,
      rootDir,
      sourceLocale,
      extension,
      localeCodes
    });
  }

  const targetCatalogs = targetLocales.map(
    (locale): Catalog => mergeLocale(groups, locale) ?? {locale, messages: []}
  );

  return {catalogs: [sourceCatalog, ...targetCatalogs], groups, codecFactory};
}

/**
 * The shared-file counterpart of the per-locale discovery below: each matched
 * file is decoded once with its own codec instance, the locales come from
 * inside the files, and each file becomes one group carrying the decoding
 * instance for the write-back.
 */
async function loadSharedGroups(input: {
  entries: Array<ParsedPathEntry>;
  sourceLocale: string;
  locales: 'infer' | ReadonlyArray<string> | undefined;
  rootDir: string;
  extension: string;
  localeCodes: LocaleCodes;
  codecFactory(): MessagesCodec;
}): Promise<LoadedCatalogs> {
  const {
    entries,
    sourceLocale,
    locales,
    rootDir,
    extension,
    localeCodes,
    codecFactory
  } = input;

  type SharedRead = {
    template: ParsedTemplate;
    namespace: string | undefined;
    filePath: string;
    codec: SharedFileCodec;
    decoded: Record<string, Array<ExtractorMessage>>;
  };

  const reads: Array<SharedRead> = [];
  for (const entry of entries) {
    // parsePathEntry rejects split entries for a shared codec.
    const {template} = entry as Extract<ParsedPathEntry, {kind: 'template'}>;
    const matches = await discoverFiles({
      template,
      rootDir,
      extension,
      localeCodes
    });
    for (const match of matches) {
      const codec = codecFactory() as SharedFileCodec;
      const decoded = await decodeSharedFile(codec, match.filePath);
      if (!decoded) continue;
      reads.push({
        template,
        namespace: match.namespace,
        filePath: match.filePath,
        codec,
        decoded
      });
    }
  }

  const targetLocales = resolveTargetLocales(
    reads.flatMap((read) => Object.keys(read.decoded)),
    sourceLocale,
    locales
  );
  const allowed = new Set([sourceLocale, ...targetLocales]);

  const groups = reads.map((read): CatalogGroup => {
    const byLocale = new Map<string, Catalog>();
    for (const [locale, messages] of Object.entries(read.decoded)) {
      if (!allowed.has(locale)) continue;
      byLocale.set(locale, {
        locale,
        file: read.filePath,
        messages: addNamespacePrefix(messages, read.namespace)
      });
    }
    return {
      path: read.template.source,
      namespace: read.namespace,
      byLocale,
      resolveFile: () => read.filePath,
      shared: {file: read.filePath, codec: read.codec}
    };
  });

  const sourceCatalog = mergeLocale(groups, sourceLocale);
  if (!sourceCatalog) {
    throw await missingSourceError({
      entries,
      rootDir,
      sourceLocale,
      extension,
      localeCodes,
      sharedFiles: reads.map((read) => read.filePath)
    });
  }

  const targetCatalogs = targetLocales.map(
    (locale): Catalog => mergeLocale(groups, locale) ?? {locale, messages: []}
  );

  return {catalogs: [sourceCatalog, ...targetCatalogs], groups, codecFactory};
}

/** `undefined` when the file vanished since discovery. */
async function decodeSharedFile(
  codec: SharedFileCodec,
  filePath: string
): Promise<Record<Locale, Array<ExtractorMessage>> | undefined> {
  const content = await readIfExists(filePath);
  if (content === undefined) return undefined;
  try {
    return codec.decodeAll(content);
  } catch (error) {
    throw toDecodeError(error, filePath);
  }
}

/**
 * Two files claiming one locale is what a `messages.codes` mapping looks like
 * when its code is also how another locale writes its own files. Which locale
 * a file belongs to is only decidable once the walk has both of them, so the
 * ambiguity is reported here, naming the files, rather than guessed at from
 * the config. Under `locales: 'infer'` there is no locale set to guess with.
 */
function assertOneFilePerLocale(matches: Array<Match>, rootDir: string): void {
  const byLocale = new Map<string, string>();
  for (const {locale, filePath} of matches) {
    const existing = byLocale.get(locale);
    if (existing !== undefined && existing !== filePath) {
      throw new UserError(`Two files resolve to the locale "${locale}"`, {
        details: {
          heading: 'Both matched:',
          items: [
            path.relative(rootDir, existing),
            path.relative(rootDir, filePath)
          ]
        },
        hint: 'A messages.codes entry maps one of them to a locale the other already covers. Give that locale a code no other locale writes.'
      });
    }
    byLocale.set(locale, filePath);
  }
}

/**
 * A mapped code that collides with another locale's tag (or mapped code)
 * would make a matched file ambiguous.
 */
function assertUnambiguousCodes(
  allowed: Set<string>,
  localeCodes: LocaleCodes
): void {
  const byCode = new Map<string, string>();
  for (const locale of allowed) {
    const code = localeCodes.toCode(locale);
    const existing = byCode.get(code);
    if (existing !== undefined) {
      throw new UserError(
        `Locales "${existing}" and "${locale}" both resolve to the path code "${code}"`,
        {
          hint: 'Adjust messages.codes so each locale resolves to its own code.'
        }
      );
    }
    byCode.set(code, locale);
  }
}

/** The template that computes a locale's file within an entry. */
function templateForLocale(
  entry: ParsedPathEntry,
  locale: string,
  sourceLocale: string
): ParsedTemplate {
  if (entry.kind === 'template') return entry.template;
  return locale === sourceLocale ? entry.source : entry.targets;
}

/** The user-facing string identifying an entry in errors and reports. */
function entryDisplayPath(entry: ParsedPathEntry): string {
  return entry.kind === 'template'
    ? entry.template.source
    : entry.targets.source;
}

async function buildGroups(input: {
  discoveries: Array<Discovery>;
  allowed: Set<string>;
  sourceLocale: string;
  codecFactory(): SeparateFileCodec;
  rootDir: string;
  extension: string;
  localeCodes: LocaleCodes;
}): Promise<Array<CatalogGroup>> {
  const {
    discoveries,
    allowed,
    sourceLocale,
    codecFactory,
    rootDir,
    extension,
    localeCodes
  } = input;
  const groups: Array<CatalogGroup> = [];

  for (const {entry, matches} of discoveries) {
    // Bucket by namespace (undefined when the template has no `{namespace}`).
    const byNamespace = new Map<string | undefined, Array<Match>>();
    for (const match of matches) {
      if (!allowed.has(match.locale)) continue;
      const list = byNamespace.get(match.namespace) ?? [];
      list.push(match);
      byNamespace.set(match.namespace, list);
    }

    for (const [namespace, groupMatches] of byNamespace) {
      assertOneFilePerLocale(groupMatches, rootDir);
      const byLocale = new Map<string, Catalog>();
      await Promise.all(
        groupMatches.map(async (match) => {
          const codec = codecFactory();
          const catalog = await readCatalogFile({
            filePath: match.filePath,
            locale: match.locale,
            sourceLocale,
            codec,
            namespace
          });
          if (catalog) byLocale.set(match.locale, catalog);
        })
      );

      groups.push({
        path: entryDisplayPath(entry),
        namespace,
        byLocale,
        resolveFile: (locale) =>
          substituteTemplate(
            templateForLocale(entry, locale, sourceLocale),
            {locale, namespace},
            rootDir,
            extension,
            localeCodes
          )
      });
    }
  }

  return groups;
}

/** Merges one locale's catalog across groups (later groups win), or `undefined` if no group has it. */
function mergeLocale(
  groups: Array<CatalogGroup>,
  locale: string
): Catalog | undefined {
  let byId: Map<string, ExtractorMessage> | undefined;
  let file: string | undefined;
  for (const group of groups) {
    const catalog = group.byLocale.get(locale);
    if (!catalog) continue;
    file ??= catalog.file;
    byId ??= new Map();
    for (const message of catalog.messages) byId.set(message.id, message);
  }
  return byId ? {locale, file, messages: [...byId.values()]} : undefined;
}

function resolveTargetLocales(
  discovered: Array<string>,
  sourceLocale: string,
  locales: 'infer' | ReadonlyArray<string> | undefined
): Array<string> {
  if (Array.isArray(locales)) {
    return unique(locales.filter((locale) => locale !== sourceLocale));
  }
  return unique(discovered).filter((locale) => locale !== sourceLocale);
}

function unique(values: Array<string>): Array<string> {
  return [...new Set(values)];
}

async function missingSourceError(input: {
  entries: Array<ParsedPathEntry>;
  rootDir: string;
  sourceLocale: string;
  extension: string;
  localeCodes: LocaleCodes;
  /** Shared files that were read (shared-file formats only). */
  sharedFiles?: Array<string>;
}): Promise<UserError> {
  const {entries, rootDir, sourceLocale, extension, localeCodes, sharedFiles} =
    input;

  // Shared files exist but none holds the source locale, so the fix is inside
  // the files (or in the config), not a file to create
  if (sharedFiles && sharedFiles.length > 0) {
    const files = sharedFiles.map((file) => path.relative(rootDir, file));
    return new UserError(
      `No messages found for source locale "${sourceLocale}"`,
      {
        code: 'MISSING_SOURCE_CATALOG',
        details:
          files.length === 1 ? files[0] : {heading: 'Looked in:', items: files},
        hint: `Add messages for "${sourceLocale}", or set messages.sourceLocale to a locale your messages file contains.`
      }
    );
  }

  // For a split entry the source path itself is the file to create, so the
  // error anchors on it rather than on the targets template.
  const sourceTemplates = entries.map((entry) =>
    entry.kind === 'template' ? entry.template : entry.source
  );
  const folders = sourceTemplates.map((template) =>
    path.relative(rootDir, resolveBaseDir(template, rootDir))
  );
  const present = await Promise.all(
    sourceTemplates.map((template) =>
      isDirectory(resolveBaseDir(template, rootDir))
    )
  );

  // A representative on-disk filename for the hint: the source locale
  // substituted in, `{namespace}` kept as-is (its value is the user's
  // choice), shown relative to the project root like the headline's folder.
  function exampleFile(template: ParsedTemplate): string {
    return path.relative(
      rootDir,
      substituteTemplate(
        template,
        {locale: sourceLocale, namespace: '{namespace}'},
        rootDir,
        extension,
        localeCodes
      )
    );
  }

  if (!present.some(Boolean)) {
    return new UserError(
      folders.length === 1
        ? `Messages folder not found at ${folders[0]}/`
        : 'No messages folder found',
      folders.length === 1
        ? {
            code: 'MESSAGES_DIR_NOT_FOUND',
            hint: `Create ${exampleFile(sourceTemplates[0])}, or update messages.path to point to a valid folder.`
          }
        : {
            code: 'MESSAGES_DIR_NOT_FOUND',
            details: {
              heading: 'Expected one of:',
              items: folders.map((folder) => `${folder}/`)
            },
            hint: `Create one of these with a ${sourceLocale}${extension} file inside, or update messages.path.`
          }
    );
  }

  return new UserError(
    `No messages found for source locale "${sourceLocale}"`,
    folders.length === 1
      ? {
          code: 'MISSING_SOURCE_CATALOG',
          hint: `Create ${exampleFile(sourceTemplates[0])} or set messages.sourceLocale to a locale you support.`
        }
      : {
          code: 'MISSING_SOURCE_CATALOG',
          details: {heading: 'Looked in:', items: folders},
          hint: `Create a ${sourceLocale}${extension} file in one of your messages folders, or set messages.sourceLocale to a locale you support.`
        }
  );
}

async function isDirectory(dirPath: string): Promise<boolean> {
  try {
    return (await fs.stat(dirPath)).isDirectory();
  } catch {
    return false;
  }
}
