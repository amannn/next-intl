import {mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import createJsonCodec from '@eloqnt/format-json';
import {describe, expect, it} from 'vite-plus/test';
import type UserError from '../UserError.js';
import loadCatalogs, {type LoadCatalogsOptions} from './loadCatalogs.js';
import type {MessagesCodec} from './types.js';

function loadCatalogGroups(
  options: Omit<LoadCatalogsOptions, 'codecFactory' | 'extension'> &
    Partial<Pick<LoadCatalogsOptions, 'codecFactory'>>
) {
  return loadCatalogs({
    codecFactory: createJsonCodec,
    extension: '.json',
    ...options
  });
}

async function tempDir() {
  const path = await mkdtemp(join(tmpdir(), 'eloqnt-load-'));
  return {
    path,
    async writeFile(relative: string, content: unknown) {
      const filePath = join(path, relative);
      await mkdir(join(filePath, '..'), {recursive: true});
      await writeFile(
        filePath,
        typeof content === 'string' ? content : JSON.stringify(content),
        'utf8'
      );
    },
    [Symbol.asyncDispose]: () => rm(path, {recursive: true, force: true})
  };
}

describe('bare directory (default layout)', () => {
  it('reads one file per locale', async () => {
    await using tmp = await tempDir();
    await tmp.writeFile('messages/en.json', {greeting: 'Hello'});
    await tmp.writeFile('messages/de.json', {greeting: 'Hallo'});

    const {catalogs, groups} = await loadCatalogGroups({
      messagesPath: 'messages',
      sourceLocale: 'en',
      rootDir: tmp.path
    });

    expect(catalogs.map((catalog) => catalog.locale)).toEqual(['en', 'de']);
    expect(catalogs[0].messages.map((message) => message.id)).toEqual([
      'greeting'
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].namespace).toBeUndefined();
    expect(groups[0].resolveFile('fr')).toBe(
      join(tmp.path, 'messages/fr.json')
    );
  });
});

describe('{locale}/{namespace} template', () => {
  it('captures namespace as an id prefix and produces one group per namespace', async () => {
    await using tmp = await tempDir();
    await tmp.writeFile('locales/en/common.json', {greeting: 'Hello'});
    await tmp.writeFile('locales/en/auth.json', {login: 'Sign in'});
    await tmp.writeFile('locales/de/common.json', {greeting: 'Hallo'});

    const {catalogs, groups} = await loadCatalogGroups({
      messagesPath: 'locales/{locale}/{namespace}',
      sourceLocale: 'en',
      rootDir: tmp.path
    });

    expect(catalogs[0].locale).toBe('en');
    expect(catalogs[0].messages.map((message) => message.id).sort()).toEqual([
      'auth.login',
      'common.greeting'
    ]);
    expect(groups).toHaveLength(2);
    expect(groups.map((group) => group.namespace!).sort()).toEqual([
      'auth',
      'common'
    ]);
    const commonGroup = groups.find((group) => group.namespace === 'common')!;
    expect(commonGroup.resolveFile('fr')).toBe(
      join(tmp.path, 'locales/fr/common.json')
    );
  });
});

describe('{namespace}/{locale} template', () => {
  it('walks the namespace-first layout and prefixes ids', async () => {
    await using tmp = await tempDir();
    await tmp.writeFile('messages/common/en.json', {greeting: 'Hello'});
    await tmp.writeFile('messages/common/de.json', {greeting: 'Hallo'});
    await tmp.writeFile('messages/auth/en.json', {login: 'Sign in'});

    const {catalogs, groups} = await loadCatalogGroups({
      messagesPath: 'messages/{namespace}/{locale}',
      sourceLocale: 'en',
      rootDir: tmp.path
    });

    expect(catalogs[0].messages.map((message) => message.id).sort()).toEqual([
      'auth.login',
      'common.greeting'
    ]);
    expect(groups.map((group) => group.namespace!).sort()).toEqual([
      'auth',
      'common'
    ]);
    const authGroup = groups.find((group) => group.namespace === 'auth')!;
    expect(authGroup.resolveFile('de')).toBe(
      join(tmp.path, 'messages/auth/de.json')
    );
  });
});

describe('template with a literal-suffixed capture', () => {
  it('handles patterns like {locale}.lproj/Localizable', async () => {
    await using tmp = await tempDir();
    await tmp.writeFile('Localization/en.lproj/Localizable.json', {
      welcome: 'Welcome'
    });
    await tmp.writeFile('Localization/de.lproj/Localizable.json', {
      welcome: 'Willkommen'
    });

    const {catalogs, groups} = await loadCatalogGroups({
      messagesPath: 'Localization/{locale}.lproj/Localizable',
      sourceLocale: 'en',
      rootDir: tmp.path
    });

    expect(catalogs.map((catalog) => catalog.locale)).toEqual(['en', 'de']);
    expect(catalogs[0].messages.map((message) => message.id)).toEqual([
      'welcome'
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].namespace).toBeUndefined();
    expect(groups[0].resolveFile('fr')).toBe(
      join(tmp.path, 'Localization/fr.lproj/Localizable.json')
    );
  });
});

describe('split source/targets entries', () => {
  it('binds the source path to the source locale and targets to their capture', async () => {
    await using tmp = await tempDir();
    await tmp.writeFile('i18n/Messages.json', {greeting: 'Hello'});
    await tmp.writeFile('i18n/Messages_de.json', {greeting: 'Hallo'});

    const {catalogs, groups} = await loadCatalogGroups({
      messagesPath: {
        source: 'i18n/Messages',
        targets: 'i18n/Messages_{locale}'
      },
      sourceLocale: 'en',
      rootDir: tmp.path
    });

    expect(catalogs.map((catalog) => catalog.locale)).toEqual(['en', 'de']);
    expect(catalogs[0].file).toBe(join(tmp.path, 'i18n/Messages.json'));
    expect(groups).toHaveLength(1);
    expect(groups[0].resolveFile('en')).toBe(
      join(tmp.path, 'i18n/Messages.json')
    );
    expect(groups[0].resolveFile('fr')).toBe(
      join(tmp.path, 'i18n/Messages_fr.json')
    );
  });

  it('prefers the source path when a target file resolves to the source locale', async () => {
    await using tmp = await tempDir();
    await tmp.writeFile('i18n/Messages.json', {greeting: 'Hello'});
    await tmp.writeFile('i18n/Messages_en.json', {greeting: 'Shadowed'});

    const {catalogs} = await loadCatalogGroups({
      messagesPath: {
        source: 'i18n/Messages',
        targets: 'i18n/Messages_{locale}'
      },
      sourceLocale: 'en',
      rootDir: tmp.path
    });

    expect(catalogs[0].file).toBe(join(tmp.path, 'i18n/Messages.json'));
    expect(catalogs[0].messages[0].message).toBe('Hello');
  });
});

describe('{code} token with messages.codes', () => {
  it('maps captured codes back to locales, unmapped ones passing through', async () => {
    await using tmp = await tempDir();
    await tmp.writeFile('res/values/strings.json', {greeting: 'Hello'});
    await tmp.writeFile('res/values-de-rAT/strings.json', {greeting: 'Servus'});
    await tmp.writeFile('res/values-fr/strings.json', {greeting: 'Bonjour'});

    const {catalogs, groups} = await loadCatalogGroups({
      messagesPath: {
        source: 'res/values/strings',
        targets: 'res/values-{code}/strings'
      },
      codes: {'de-AT': 'de-rAT'},
      sourceLocale: 'en',
      rootDir: tmp.path
    });

    expect(catalogs.map((catalog) => catalog.locale).sort()).toEqual([
      'de-AT',
      'en',
      'fr'
    ]);
    expect(groups[0].resolveFile('de-AT')).toBe(
      join(tmp.path, 'res/values-de-rAT/strings.json')
    );
    expect(groups[0].resolveFile('fr')).toBe(
      join(tmp.path, 'res/values-fr/strings.json')
    );
  });
});

describe('shared-file codec', () => {
  /** The docs' shared JSON example: locales nested under a top-level key. */
  function sharedJsonCodec(): MessagesCodec {
    let parsed: Record<string, Record<string, string>> = {};
    return {
      file: 'shared',
      decodeAll(content: string) {
        parsed = JSON.parse(content) as Record<string, Record<string, string>>;
        return Object.fromEntries(
          Object.entries(parsed).map(([locale, messages]) => [
            locale,
            Object.entries(messages).map(([id, message]) => ({
              id,
              message,
              description: [],
              references: []
            }))
          ])
        );
      },
      encodeAll(messagesByLocale) {
        const data = {...parsed};
        for (const [locale, messages] of Object.entries(messagesByLocale)) {
          data[locale] = Object.fromEntries(
            messages.map((message) => [message.id, message.message])
          );
        }
        return JSON.stringify(data);
      }
    };
  }

  it('reads every locale from the one file and resolves writes back to it', async () => {
    await using tmp = await tempDir();
    await tmp.writeFile('messages.json', {
      en: {greeting: 'Hello'},
      de: {greeting: 'Hallo'}
    });

    const {catalogs, groups} = await loadCatalogGroups({
      messagesPath: 'messages',
      sourceLocale: 'en',
      codecFactory: sharedJsonCodec,
      rootDir: tmp.path
    });

    expect(catalogs.map((catalog) => catalog.locale)).toEqual(['en', 'de']);
    expect(catalogs[0].file).toBe(join(tmp.path, 'messages.json'));
    expect(groups).toHaveLength(1);
    expect(groups[0].shared?.file).toBe(join(tmp.path, 'messages.json'));
    expect(groups[0].resolveFile('fr')).toBe(join(tmp.path, 'messages.json'));
  });

  it('captures {namespace} as one group per file with prefixed ids', async () => {
    await using tmp = await tempDir();
    await tmp.writeFile('catalogs/main.json', {en: {title: 'Home'}});
    await tmp.writeFile('catalogs/auth.json', {en: {login: 'Sign in'}});

    const {catalogs, groups} = await loadCatalogGroups({
      messagesPath: 'catalogs/{namespace}',
      sourceLocale: 'en',
      codecFactory: sharedJsonCodec,
      rootDir: tmp.path
    });

    expect(catalogs[0].messages.map((message) => message.id).sort()).toEqual([
      'auth.login',
      'main.title'
    ]);
    expect(groups.map((group) => group.namespace!).sort()).toEqual([
      'auth',
      'main'
    ]);
  });

  it('rejects a locale placeholder in the path', async () => {
    await using tmp = await tempDir();

    await expect(
      loadCatalogGroups({
        messagesPath: 'messages/{locale}',
        sourceLocale: 'en',
        codecFactory: sharedJsonCodec,
        rootDir: tmp.path
      })
    ).rejects.toThrow(/locale placeholder with a shared-file format/);
  });

  it('rejects a split source/targets entry', async () => {
    await using tmp = await tempDir();

    await expect(
      loadCatalogGroups({
        messagesPath: {source: 'i18n/Messages', targets: 'i18n/{locale}'},
        sourceLocale: 'en',
        codecFactory: sharedJsonCodec,
        rootDir: tmp.path
      })
    ).rejects.toThrow(/can't split source and targets/);
  });

  it('points inside the file when the source locale is missing from it', async () => {
    await using tmp = await tempDir();
    await tmp.writeFile('messages.json', {de: {greeting: 'Hallo'}});

    const error = await loadSharedError({
      messagesPath: 'messages',
      sourceLocale: 'en',
      codecFactory: sharedJsonCodec,
      rootDir: tmp.path
    });

    expect(error.code).toBe('MISSING_SOURCE_CATALOG');
    expect(error.details).toBe('messages.json');
    expect(error.hint).toContain('messages.sourceLocale');
  });

  async function loadSharedError(
    options: Parameters<typeof loadCatalogGroups>[0]
  ): Promise<UserError> {
    try {
      await loadCatalogGroups(options);
    } catch (error) {
      return error as UserError;
    }
    throw new Error('expected loadCatalogGroups to reject');
  }
});

describe('error handling', () => {
  async function loadError(
    options: Parameters<typeof loadCatalogGroups>[0]
  ): Promise<UserError> {
    try {
      await loadCatalogGroups(options);
    } catch (error) {
      return error as UserError;
    }
    throw new Error('expected loadCatalogGroups to reject');
  }

  it('rejects two tokens in one path segment with a helpful hint', async () => {
    await using tmp = await tempDir();
    await tmp.writeFile('messages/about_en.json', {title: 'About'});

    await expect(
      loadCatalogGroups({
        messagesPath: 'messages/{namespace}_{locale}',
        sourceLocale: 'en',
        rootDir: tmp.path
      })
    ).rejects.toThrow(/Multiple tokens in one path segment/);
  });

  it('rejects unknown token names with a list of supported tokens', async () => {
    await using tmp = await tempDir();
    await tmp.writeFile('messages/en.json', {greeting: 'Hello'});

    await expect(
      loadCatalogGroups({
        messagesPath: 'messages/{lang}',
        sourceLocale: 'en',
        rootDir: tmp.path
      })
    ).rejects.toThrow(/Unknown token "\{lang\}"/);
  });

  it('rejects a template that uses the same token twice', async () => {
    await using tmp = await tempDir();

    await expect(
      loadCatalogGroups({
        messagesPath: 'messages/{locale}/{locale}',
        sourceLocale: 'en',
        rootDir: tmp.path
      })
    ).rejects.toThrow(/uses \{locale\} more than once/);
  });

  it('rejects a source path that contains a locale placeholder', async () => {
    await using tmp = await tempDir();

    await expect(
      loadCatalogGroups({
        messagesPath: {
          source: 'i18n/Messages_{locale}',
          targets: 'i18n/Messages_{locale}'
        },
        sourceLocale: 'en',
        rootDir: tmp.path
      })
    ).rejects.toThrow(/must not contain \{locale\} or \{code\}/);
  });

  it('rejects a targets template without a locale placeholder', async () => {
    await using tmp = await tempDir();

    await expect(
      loadCatalogGroups({
        messagesPath: {source: 'i18n/Messages', targets: 'i18n/Messages'},
        sourceLocale: 'en',
        rootDir: tmp.path
      })
    ).rejects.toThrow(/needs \{locale\} or \{code\}/);
  });

  it('rejects {namespace} in only one side of a split entry', async () => {
    await using tmp = await tempDir();

    await expect(
      loadCatalogGroups({
        messagesPath: {
          source: 'i18n/{namespace}/Messages',
          targets: 'i18n/Messages_{locale}'
        },
        sourceLocale: 'en',
        rootDir: tmp.path
      })
    ).rejects.toThrow(/\{namespace\} must appear in both/);
  });

  it('rejects a template that uses both {locale} and {code}', async () => {
    await using tmp = await tempDir();

    await expect(
      loadCatalogGroups({
        messagesPath: 'messages/{locale}/{code}',
        sourceLocale: 'en',
        rootDir: tmp.path
      })
    ).rejects.toThrow(/uses both \{locale\} and \{code\}/);
  });

  it('rejects two locales mapped to the same code', async () => {
    await using tmp = await tempDir();
    await tmp.writeFile('messages/en.json', {greeting: 'Hello'});

    const error = await loadError({
      messagesPath: 'messages',
      codes: {'de-AT': 'de-x', 'de-CH': 'de-x'},
      sourceLocale: 'en',
      rootDir: tmp.path
    });

    expect(error.message).toContain('same code "de-x"');
  });

  it('accepts a tag-shaped code when the locales are inferred', async () => {
    await using tmp = await tempDir();
    await tmp.writeFile('messages/en.json', {greeting: 'Hello'});
    // `ry` is how Crowdin writes Rusyn, and reads as a locale tag itself. It
    // names nothing else here, so the mapping is what the file means.
    await tmp.writeFile('messages/ry.json', {greeting: 'Витай'});

    const {catalogs} = await loadCatalogGroups({
      messagesPath: 'messages/{code}',
      codes: {rue: 'ry'},
      sourceLocale: 'en',
      rootDir: tmp.path
    });

    expect(catalogs.map((catalog) => catalog.locale)).toEqual(['en', 'rue']);
  });

  it('rejects a code once two files resolve to one locale', async () => {
    await using tmp = await tempDir();
    await tmp.writeFile('messages/en.json', {greeting: 'Hello'});
    // `de.json` is claimed by the mapping and `de-AT.json` by its own name, so
    // both land on de-AT and neither file can be said to be the locale's.
    await tmp.writeFile('messages/de.json', {greeting: 'Hallo'});
    await tmp.writeFile('messages/de-AT.json', {greeting: 'Servus'});

    const error = await loadError({
      messagesPath: 'messages/{code}',
      codes: {'de-AT': 'de'},
      sourceLocale: 'en',
      rootDir: tmp.path
    });

    expect(error.message).toContain('Two files resolve to the locale "de-AT"');
  });

  it('accepts a tag-shaped code when the locales are spelled out', async () => {
    await using tmp = await tempDir();
    await tmp.writeFile('locales/english/common.json', {greeting: 'Hello'});
    await tmp.writeFile('locales/espanol/common.json', {greeting: 'Hola'});

    // Word-named folders parse as locale tags (`english` is a well-formed
    // primary subtag), so listing the locales is what makes them usable.
    const {catalogs} = await loadCatalogGroups({
      messagesPath: 'locales/{code}/{namespace}',
      codes: {en: 'english', es: 'espanol'},
      locales: ['es'],
      sourceLocale: 'en',
      rootDir: tmp.path
    });

    expect(catalogs.map((catalog) => catalog.locale)).toEqual(['en', 'es']);
  });

  it('rejects a code that is how another listed locale is written', async () => {
    await using tmp = await tempDir();
    await tmp.writeFile('messages/en.json', {greeting: 'Hello'});

    const error = await loadError({
      messagesPath: 'messages/{code}',
      codes: {'de-AT': 'de'},
      locales: ['de', 'de-AT'],
      sourceLocale: 'en',
      rootDir: tmp.path
    });

    expect(error.message).toContain('which is how "de" is already written');
  });

  it('anchors the missing-source error on the split source path', async () => {
    await using tmp = await tempDir();
    await tmp.writeFile('i18n/Messages_de.json', {greeting: 'Hallo'});

    const error = await loadError({
      messagesPath: {
        source: 'i18n/Messages',
        targets: 'i18n/Messages_{locale}'
      },
      sourceLocale: 'en',
      rootDir: tmp.path
    });

    expect(error.code).toBe('MISSING_SOURCE_CATALOG');
    expect(error.hint).toContain('i18n/Messages.json');
  });

  it('reports MESSAGES_DIR_NOT_FOUND with a concrete example file when nothing exists', async () => {
    await using tmp = await tempDir();

    const error = await loadError({
      messagesPath: join(tmp.path, 'locales/{locale}/{namespace}'),
      sourceLocale: 'en',
      rootDir: tmp.path
    });

    expect(error.code).toBe('MESSAGES_DIR_NOT_FOUND');
    expect(error.hint).toContain('locales/en/{namespace}.json');
  });

  it('reports MISSING_SOURCE_CATALOG when only target locales exist', async () => {
    await using tmp = await tempDir();
    await tmp.writeFile('locales/de/common.json', {greeting: 'Hallo'});

    const error = await loadError({
      messagesPath: join(tmp.path, 'locales/{locale}/{namespace}'),
      sourceLocale: 'en',
      rootDir: tmp.path
    });

    expect(error.code).toBe('MISSING_SOURCE_CATALOG');
    expect(error.hint).toContain('locales/en/{namespace}.json');
  });
});

describe('Windows-style separators', () => {
  it('normalizes a backslash-separated absolute path, as the CLI resolves them on Windows', async () => {
    await using tmp = await tempDir();
    await tmp.writeFile('messages/en.json', {greeting: 'Hello'});
    await tmp.writeFile('messages/de.json', {greeting: 'Hallo'});

    const {catalogs, groups} = await loadCatalogGroups({
      messagesPath: join(tmp.path, 'messages').replaceAll('/', '\\'),
      sourceLocale: 'en',
      rootDir: tmp.path
    });

    expect(catalogs.map((catalog) => catalog.locale)).toEqual(['en', 'de']);
    expect(groups[0].resolveFile('fr')).toBe(
      join(tmp.path, 'messages/fr.json')
    );
  });

  it('normalizes backslash templates with tokens', async () => {
    await using tmp = await tempDir();
    await tmp.writeFile('locales/en/common.json', {greeting: 'Hello'});
    await tmp.writeFile('locales/de/common.json', {greeting: 'Hallo'});

    const {catalogs, groups} = await loadCatalogGroups({
      messagesPath: '.\\locales\\{locale}\\{namespace}',
      sourceLocale: 'en',
      rootDir: tmp.path
    });

    expect(catalogs[0].messages.map((message) => message.id)).toEqual([
      'common.greeting'
    ]);
    expect(groups[0].resolveFile('fr')).toBe(
      join(tmp.path, 'locales/fr/common.json')
    );
  });
});

describe('absolute templates', () => {
  it('ignores rootDir, as the CLI resolves messages.path before the SDK sees it', async () => {
    await using tmp = await tempDir();
    await tmp.writeFile('locales/en/common.json', {greeting: 'Hello'});
    await tmp.writeFile('locales/de/common.json', {greeting: 'Hallo'});

    const {catalogs, groups} = await loadCatalogGroups({
      messagesPath: join(tmp.path, 'locales/{locale}/{namespace}'),
      sourceLocale: 'en',
      rootDir: '/nonexistent-somewhere-else'
    });

    expect(catalogs.map((catalog) => catalog.locale)).toEqual(['en', 'de']);
    expect(groups[0].resolveFile('fr')).toBe(
      join(tmp.path, 'locales/fr/common.json')
    );
  });
});

describe('write/discover round-trip', () => {
  it('rediscovers files written at resolveFile paths across layouts', async () => {
    const layouts = [
      {template: 'messages', seed: 'messages/en.json'},
      {
        template: 'locales/{locale}/{namespace}',
        seed: 'locales/en/common.json'
      },
      {
        template: 'locales/{namespace}/{locale}',
        seed: 'locales/common/en.json'
      },
      {
        template: 'Localization/{locale}.lproj/Base',
        seed: 'Localization/en.lproj/Base.json'
      },
      {
        template: 'res/values-{locale}/strings',
        seed: 'res/values-en/strings.json'
      },
      {
        template: {source: 'i18n/Messages', targets: 'i18n/Messages_{locale}'},
        seed: 'i18n/Messages.json'
      }
    ];

    for (const {template, seed} of layouts) {
      await using tmp = await tempDir();
      await tmp.writeFile(seed, {greeting: 'Hello'});
      const options = {
        messagesPath: template,
        sourceLocale: 'en',
        rootDir: tmp.path
      } as const;

      const first = await loadCatalogGroups(options);
      for (const locale of ['pt-BR', 'zh-Hans']) {
        const file = first.groups[0].resolveFile(locale);
        await mkdir(dirname(file), {recursive: true});
        await writeFile(file, JSON.stringify({greeting: locale}), 'utf8');
      }

      const second = await loadCatalogGroups(options);
      expect({
        template,
        locales: second.catalogs.map((catalog) => catalog.locale).sort()
      }).toEqual({template, locales: ['en', 'pt-BR', 'zh-Hans']});
      const ids = new Set(
        second.catalogs.flatMap((catalog) =>
          catalog.messages.map((message) => message.id)
        )
      );
      expect({template, ids: [...ids]}).toEqual({
        template,
        ids: [first.catalogs[0].messages[0].id]
      });
    }
  });
});
