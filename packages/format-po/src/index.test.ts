import {describe, expect, it} from 'vite-plus/test';
import createPoCodec from './index.js';

type Message = ReturnType<ReturnType<typeof createPoCodec>['decode']>[number];

function byId(messages: Array<Message>): Map<string, Message> {
  return new Map(messages.map((message) => [message.id, message]));
}

const sourceMessages: Array<Message> = [
  {
    id: '5VpL9Z',
    message: 'Right',
    description: ['Advance to the next slide'],
    references: [{path: 'src/components/Carousel.tsx', line: 12}]
  },
  {
    id: 'carousel.next',
    message: 'Next',
    description: [],
    references: [{path: 'src/components/Carousel.tsx', line: 20}]
  },
  {
    id: 'QM7ITA',
    message: 'Hello, {name}!',
    description: [],
    references: [{path: 'src/app/page.tsx', line: 4}]
  }
];
const sourceMessagesById = byId(sourceMessages);

it('writes new files in the key-msgctxt shape', () => {
  const codec = createPoCodec();
  const output = codec.encode(sourceMessages, {
    locale: 'en',
    sourceMessagesById
  });

  expect(output).toMatchInlineSnapshot(`
    "msgid ""
    msgstr ""
    "Language: en\\n"
    "Content-Type: text/plain; charset=utf-8\\n"
    "Content-Transfer-Encoding: 8bit\\n"
    "X-Generator: @eloqnt/format-po\\n"
    "X-Message-Key: msgctxt\\n"

    #: src/app/page.tsx
    msgctxt "QM7ITA"
    msgid "Hello, {name}!"
    msgstr "Hello, {name}!"

    #. Advance to the next slide
    #: src/components/Carousel.tsx
    msgctxt "5VpL9Z"
    msgid "Right"
    msgstr "Right"

    #: src/components/Carousel.tsx
    msgctxt "carousel.next"
    msgid "Next"
    msgstr "Next"
    "
  `);
});

it('round-trips its own shape', () => {
  const writer = createPoCodec();
  const encoded = writer.encode(sourceMessages, {
    locale: 'en',
    sourceMessagesById
  });

  const reader = createPoCodec();
  const decoded = reader.decode(encoded, {locale: 'en', sourceLocale: 'en'});
  expect(byId(decoded).get('5VpL9Z')?.message).toBe('Right');
  expect(byId(decoded).get('carousel.next')?.message).toBe('Next');

  expect(reader.encode(decoded, {locale: 'en', sourceMessagesById})).toBe(
    encoded
  );
});

it('keeps a translated catalog keyed by ids, with source text as msgid', () => {
  const codec = createPoCodec();
  const output = codec.encode(
    [
      {
        id: '5VpL9Z',
        message: 'Rechts',
        description: ['Advance to the next slide'],
        references: [{path: 'src/components/Carousel.tsx', line: 12}]
      },
      {
        id: 'QM7ITA',
        message: '',
        description: [],
        references: [{path: 'src/app/page.tsx', line: 4}]
      }
    ],
    {locale: 'de', sourceMessagesById}
  );

  expect(output).toContain('msgctxt "5VpL9Z"\nmsgid "Right"\nmsgstr "Rechts"');
  expect(output).toContain(
    'msgctxt "QM7ITA"\nmsgid "Hello, {name}!"\nmsgstr ""'
  );
});

it('throws when a managed entry has no source message', () => {
  const codec = createPoCodec();
  expect(() =>
    codec.encode(
      [{id: 'gone42', message: 'Weg', description: [], references: []}],
      {locale: 'de', sourceMessagesById: new Map()}
    )
  ).toThrow('Missing source message for id "gone42" while encoding "de".');
});

describe('the current built-in shape', () => {
  const legacyFile = `msgid ""
msgstr ""
"Language: de\\n"
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"X-Generator: next-intl\\n"
"X-Crowdin-SourceKey: msgstr\\n"

#: src/app/page.tsx
msgid "QM7ITA"
msgstr "Hallo, {name}!"

#: src/components/Carousel.tsx
msgctxt "carousel"
msgid "next"
msgstr "Weiter"
`;

  it('reads it, joining the namespace back into the id', () => {
    const codec = createPoCodec();
    const decoded = byId(
      codec.decode(legacyFile, {locale: 'de', sourceLocale: 'en'})
    );
    expect(decoded.get('QM7ITA')?.message).toBe('Hallo, {name}!');
    expect(decoded.get('carousel.next')?.message).toBe('Weiter');
  });

  it('writes it back unchanged instead of silently migrating', () => {
    const codec = createPoCodec();
    const decoded = codec.decode(legacyFile, {
      locale: 'de',
      sourceLocale: 'en'
    });
    expect(codec.encode(decoded, {locale: 'de', sourceMessagesById})).toBe(
      legacyFile
    );
  });
});

describe('plain gettext files', () => {
  // `Language` deliberately not first: the round-trip must keep header order.
  const gettextSource = `msgid ""
msgstr ""
"X-Generator: @lingui/cli\\n"
"Language: en\\n"

#: src/components/InterestTabs.tsx
msgid "\\"{interestsDisplayName}\\" category (active)"
msgstr ""

#: src/view/Post.tsx
msgctxt "action"
msgid "Post"
msgstr ""

#: src/view/Feed.tsx
msgid "Following"
msgstr "Following"
`;

  it('uses the source text as the id and fills empty source msgstr', () => {
    const codec = createPoCodec();
    const decoded = byId(
      codec.decode(gettextSource, {locale: 'en', sourceLocale: 'en'})
    );

    const fallback = decoded.get('"{interestsDisplayName}" category (active)');
    expect(fallback?.message).toBe(
      '"{interestsDisplayName}" category (active)'
    );
    expect(decoded.get('action.Post')?.message).toBe('Post');
    expect(decoded.get('Following')?.message).toBe('Following');
  });

  it('keeps an empty msgstr empty in a secondary locale', () => {
    const codec = createPoCodec();
    const decoded = byId(
      codec.decode(gettextSource, {locale: 'de', sourceLocale: 'en'})
    );
    expect(
      decoded.get('"{interestsDisplayName}" category (active)')?.message
    ).toBe('');
    expect(decoded.get('action.Post')?.message).toBe('');
  });

  it('round-trips byte-identically, keeping order, headers and empty msgstr', () => {
    const codec = createPoCodec();
    const decoded = codec.decode(gettextSource, {
      locale: 'en',
      sourceLocale: 'en'
    });
    expect(
      codec.encode(decoded, {locale: 'en', sourceMessagesById: byId(decoded)})
    ).toBe(gettextSource);
  });

  it('keeps reference line numbers when the file carries them', () => {
    const file = `msgid ""
msgstr ""
"Language: en\\n"
"X-Generator: @lingui/cli\\n"

#: src/components/Carousel.tsx:12
#: src/components/Carousel.tsx:87
msgid "Right"
msgstr ""

#: src/view/Feed.tsx:5
msgid "Following"
msgstr "Following"
`;
    const codec = createPoCodec();
    const decoded = codec.decode(file, {locale: 'en', sourceLocale: 'en'});
    expect(
      codec.encode(decoded, {locale: 'en', sourceMessagesById: byId(decoded)})
    ).toBe(file);
  });

  it('writes a changed source message instead of the stale empty msgstr', () => {
    const codec = createPoCodec();
    const decoded = codec.decode(gettextSource, {
      locale: 'en',
      sourceLocale: 'en'
    });
    const changed = decoded.map((message) =>
      message.id === 'Following' ? {...message, message: 'Followed'} : message
    );
    const output = codec.encode(changed, {
      locale: 'en',
      sourceMessagesById: byId(changed)
    });
    expect(output).toContain('msgstr "Followed"');
  });

  it('writes new translations keyless, restoring a context from the id', () => {
    const source = createPoCodec();
    const decodedSource = source.decode(gettextSource, {
      locale: 'en',
      sourceLocale: 'en'
    });

    const target = createPoCodec();
    target.decode(
      `msgid ""
msgstr ""
"Language: de\\n"
`,
      {locale: 'de', sourceLocale: 'en'}
    );
    const output = target.encode(
      [
        {
          id: '"{interestsDisplayName}" category (active)',
          message: 'Kategorie „{interestsDisplayName}“ (aktiv)',
          description: [],
          references: []
        },
        {id: 'action.Post', message: 'Posten', description: [], references: []}
      ],
      {locale: 'de', sourceMessagesById: byId(decodedSource)}
    );

    expect(output).toContain(
      'msgid "\\"{interestsDisplayName}\\" category (active)"\nmsgstr "Kategorie „{interestsDisplayName}“ (aktiv)"'
    );
    expect(output).toContain('msgctxt "action"\nmsgid "Post"\nmsgstr "Posten"');
    expect(output).not.toContain('X-Message-Key');
  });
});

it('round-trips flags', () => {
  const codec = createPoCodec();
  const file = `msgid ""
msgstr ""
"X-Message-Key: msgctxt\\n"

#: src/Greeting.tsx
#, fuzzy, c-format
msgctxt "5VpL9Z"
msgid "Right"
msgstr "Rechts"
`;
  const decoded = codec.decode(file, {locale: 'de', sourceLocale: 'en'});
  expect(decoded[0]?.flags).toEqual(['fuzzy', 'c-format']);
  expect(codec.encode(decoded, {locale: 'de', sourceMessagesById})).toContain(
    '#, fuzzy, c-format'
  );
});

it('orders messages on the same line by column, whatever the input order', () => {
  const messages: Parameters<ReturnType<typeof createPoCodec>['encode']>[0] = [
    {
      id: 'cancel',
      message: 'Cancel',
      description: [],
      references: [{path: 'src/Dialog.tsx', line: 5, column: 40}]
    },
    {
      id: 'save',
      message: 'Save',
      description: [],
      references: [{path: 'src/Dialog.tsx', line: 5, column: 10}]
    }
  ];
  const context = {
    locale: 'en',
    sourceMessagesById: new Map(
      messages.map((message) => [message.id, message])
    )
  };

  const output = createPoCodec().encode(messages, context);
  expect(createPoCodec().encode(messages.toReversed(), context)).toBe(output);
  expect(output.indexOf('msgid "Save"')).toBeLessThan(
    output.indexOf('msgid "Cancel"')
  );
  expect(output).toContain('#: src/Dialog.tsx\n');
});

it('treats a blank file as new', () => {
  const codec = createPoCodec();
  codec.decode('\n', {locale: 'fr', sourceLocale: 'en'});
  const output = codec.encode(
    [{id: '5VpL9Z', message: '', description: [], references: []}],
    {locale: 'fr', sourceMessagesById}
  );
  expect(output).toContain('X-Message-Key: msgctxt');
  expect(output).toContain('msgctxt "5VpL9Z"\nmsgid "Right"\nmsgstr ""');
});

describe('an unknown source locale', () => {
  // next-intl can load messages without `messages.sourceLocale`, in which case
  // it passes no source locale at runtime despite what the type promises.
  const withoutSourceLocale = {
    locale: 'en',
    sourceLocale: undefined as unknown as string
  };

  const emptyMessage = `msgid ""
msgstr ""
"Language: en\\n"
"X-Generator: @lingui/cli\\n"

#: src/view/Feed.tsx
msgid "Following"
msgstr ""
`;
  const filledMessage = `msgid ""
msgstr ""
"Language: en\\n"
"X-Generator: @lingui/cli\\n"

#: src/view/Feed.tsx
msgid "Following"
msgstr "Following"
`;

  it('throws on an empty msgstr it cannot attribute', () => {
    expect(() =>
      createPoCodec().decode(emptyMessage, withoutSourceLocale)
    ).toThrow('Found an empty msgstr in the "en" messages file');
  });

  it('reads a file without an empty msgstr', () => {
    const decoded = createPoCodec().decode(filledMessage, withoutSourceLocale);
    expect(decoded[0]?.message).toBe('Following');
  });

  it('reads the id-msgid shape, where an empty msgstr never falls back', () => {
    const decoded = createPoCodec().decode(
      `msgid ""
msgstr ""
"Language: en\\n"
"X-Crowdin-SourceKey: msgstr\\n"

#: src/app/page.tsx
msgid "QM7ITA"
msgstr ""
`,
      withoutSourceLocale
    );
    expect(decoded[0]?.message).toBe('');
  });
});
