import {describe, expect, it} from 'vitest';
import POParser from './POParser.js';

describe('parse', () => {
  it('parses a basic message', () => {
    expect(
      POParser.parse(`
msgid "+YJVTi"
msgstr "Hey"
`)
    ).toEqual({
      messages: [
        {
          id: '+YJVTi',
          message: 'Hey'
        }
      ]
    });
  });

  it('handles irregular whitespace', () => {
    expect(
      POParser.parse(`
  msgid "+YJVTi"
msgstr    "Hey"  
`)
    ).toEqual({
      messages: [
        {
          id: '+YJVTi',
          message: 'Hey'
        }
      ]
    });
  });

  it('parses a message with a namespace', () => {
    expect(
      POParser.parse(`
msgctxt "ui.greeting"
msgid "+YJVTi"
msgstr "Hey"
`)
    ).toEqual({
      messages: [
        {
          id: 'ui.greeting.+YJVTi',
          message: 'Hey'
        }
      ]
    });
  });

  it('parses multiple messages with arbitrary whitespace', () => {
    expect(
      POParser.parse(`
msgid "+YJVTi"
msgstr "Hey"

msgid "fDJkF2"
msgstr "Hello"


msgid "aZdGjT"
msgstr "World"
`)
    ).toEqual({
      messages: [
        {
          id: '+YJVTi',
          message: 'Hey'
        },
        {
          id: 'fDJkF2',
          message: 'Hello'
        },
        {
          id: 'aZdGjT',
          message: 'World'
        }
      ]
    });
  });

  it('parses a file path', () => {
    expect(
      POParser.parse(`
#: src/components/Greeting.tsx
msgid "+YJVTi"
msgstr "Hey"
`)
    ).toEqual({
      messages: [
        {
          id: '+YJVTi',
          message: 'Hey',
          references: [
            {
              path: 'src/components/Greeting.tsx'
            }
          ]
        }
      ]
    });
  });

  it('parses a file path and line number', () => {
    expect(
      POParser.parse(`
#: src/components/Greeting.tsx:120
msgid "+YJVTi"
msgstr "Hey"
`)
    ).toEqual({
      messages: [
        {
          id: '+YJVTi',
          message: 'Hey',
          references: [
            {
              path: 'src/components/Greeting.tsx',
              line: 120
            }
          ]
        }
      ]
    });
  });

  it('parses multiple file paths', () => {
    expect(
      POParser.parse(`
#: src/components/Greeting.tsx:120
#: src/components/Greeting.tsx:121
msgid "+YJVTi"
msgstr "Hey"
`)
    ).toEqual({
      messages: [
        {
          id: '+YJVTi',
          message: 'Hey',
          references: [
            {
              path: 'src/components/Greeting.tsx',
              line: 120
            },
            {
              path: 'src/components/Greeting.tsx',
              line: 121
            }
          ]
        }
      ]
    });
  });

  it('parses a comment extracted from the source code', () => {
    expect(
      POParser.parse(`
#. Shown on home screen
msgid "+YJVTi"
msgstr "Hey"
`)
    ).toEqual({
      messages: [
        {
          id: '+YJVTi',
          message: 'Hey',
          description: 'Shown on home screen'
        }
      ]
    });
  });

  it('parses metadata', () => {
    // "The header contains meta-information about the content in the file.
    // It is marked with the first empty translation entry in the PO file."
    // Source: https://pofile.net
    expect(
      POParser.parse(`
msgid ""
msgstr ""
"POT-Creation-Date: 2025-10-27 16:00+0000\n"
"MIME-Version: 1.0\n"
"Content-Type: text/plain; charset=UTF-8\n"
"Content-Transfer-Encoding: 8bit\n"
"X-Generator: next-intl\n"
"Language: en-GB\n"
"Project-Id-Version: 123\n"
"Report-Msgid-Bugs-To: \n"
"PO-Revision-Date: 2025-10-23 16:19\n"
"Last-Translator: \n"
"Language-Team: English, United Kingdom\n"
"X-Crowdin-Project: 123\n"
"X-Crowdin-Project-ID: 1\n"
"X-Crowdin-Language: en-GB\n"
"X-Crowdin-File: /messages/en.po\n"
"X-Crowdin-File-ID: 11\n"
`)
    ).toEqual({
      meta: {
        'POT-Creation-Date': '2025-10-27 16:00+0000',
        'MIME-Version': '1.0',
        'Content-Type': 'text/plain; charset=UTF-8',
        'Content-Transfer-Encoding': '8bit',
        'X-Generator': 'next-intl',
        Language: 'en-GB',
        'Project-Id-Version': '123',
        'Report-Msgid-Bugs-To': '',
        'PO-Revision-Date': '2025-10-23 16:19',
        'Last-Translator': '',
        'Language-Team': 'English, United Kingdom',
        'X-Crowdin-Project': '123',
        'X-Crowdin-Project-ID': '1',
        'X-Crowdin-Language': 'en-GB',
        'X-Crowdin-File': '/messages/en.po',
        'X-Crowdin-File-ID': '11'
      }
    });
  });

  it('parses entry with multiple infos (references, description, namespace)', () => {
    expect(
      POParser.parse(`
#: src/components/Button.tsx:15
#: src/components/Button.tsx:20
#. Button text for submit action
msgctxt "ui.button"
msgid "submit"
msgstr "Submit"
`)
    ).toEqual({
      messages: [
        {
          id: 'ui.button.submit',
          message: 'Submit',
          description: 'Button text for submit action',
          references: [
            {
              path: 'src/components/Button.tsx',
              line: 15
            },
            {
              path: 'src/components/Button.tsx',
              line: 20
            }
          ]
        }
      ]
    });
  });

  it('parses numeric message IDs', () => {
    expect(
      POParser.parse(`
msgid "123"
msgstr "One hundred twenty three"
`)
    ).toEqual({
      messages: [
        {
          id: '123',
          message: 'One hundred twenty three'
        }
      ]
    });
  });

  it('parses metadata without trailing newlines', () => {
    expect(
      POParser.parse(`
msgid ""
msgstr ""
"POT-Creation-Date: 2025-10-27 16:00+0000"
"MIME-Version: 1.0"
`)
    ).toEqual({
      meta: {
        'POT-Creation-Date': '2025-10-27 16:00+0000',
        'MIME-Version': '1.0'
      }
    });
  });

  it('parses nested namespaces correctly', () => {
    expect(
      POParser.parse(`
msgctxt "ui.button.submit"
msgid "text"
msgstr "Submit"
`)
    ).toEqual({
      messages: [
        {
          id: 'ui.button.submit.text',
          message: 'Submit'
        }
      ]
    });
  });

  it('parses entries with varying flexible msgid/msgstr ordering', () => {
    expect(
      POParser.parse(`
msgstr "Hello"
msgid "greeting"

msgid "farewell"
msgstr "Goodbye"
`)
    ).toEqual({
      messages: [
        {
          id: 'greeting',
          message: 'Hello'
        },
        {
          id: 'farewell',
          message: 'Goodbye'
        }
      ]
    });
  });

  describe('error handling', () => {
    it('throws for incomplete quoted strings', () => {
      expect(() =>
        POParser.parse(`
msgid "incomplete
msgstr "message"
`)
      ).toThrow('Incomplete quoted string:\n> "incomplete');
    });

    it('throws for column numbers in references', () => {
      expect(() =>
        POParser.parse(`
#: src/components/Button.tsx:15:10
msgid "submit"
msgstr "Submit"
`)
      ).toThrow(
        'Column numbers in references are not supported:\n> #: src/components/Button.tsx:15:10'
      );
    });

    it('throws if the message is not quoted', () => {
      expect(() =>
        POParser.parse(`
msgid "+YJVTi"
msgstr 123
`)
      ).toThrow('Incomplete quoted string:\n> 123');
    });

    it('throws if the ID is not quoted', () => {
      expect(() =>
        POParser.parse(`
msgid 123
msgstr "Hey"
`)
      ).toThrow('Incomplete quoted string:\n> 123');
    });

    it('throws if no id is present', () => {
      expect(() =>
        POParser.parse(`
msgstr "Hey"
`)
      ).toThrow('Incomplete message entry: both msgid and msgstr are required');
    });

    it('throws if no message is present', () => {
      expect(() =>
        POParser.parse(`
msgid "+YJVTi"
`)
      ).toThrow('Incomplete message entry: both msgid and msgstr are required');
    });

    it('throws for usage of plurals', () => {
      expect(() =>
        POParser.parse(`
msgid "+YJVTi"
msgstr "You have one new message"
msgid_plural "You have %d new messages"
`)
      ).toThrow(
        'Plural forms (msgid_plural) are not supported:\n> msgid_plural "You have %d new messages"'
      );
    });

    it('throws for translator comments', () => {
      expect(() =>
        POParser.parse(`
# Shown on home screen
msgid "+YJVTi"
msgstr "Hey"`)
      ).toThrow(
        'Translator comments (#) are not supported:\n> # Shown on home screen'
      );
    });

    it('throws for flag comments', () => {
      expect(() =>
        POParser.parse(`
#, fuzzy
msgid "+YJVTi"
msgstr "Hey"`)
      ).toThrow('Flag comments (#,) are not supported:\n> #, fuzzy');
    });

    it('throws for previous string key comments', () => {
      expect(() =>
        POParser.parse(`
#| msgid +YJVTi
msgid "+YJVTi"
msgstr "Hey"`)
      ).toThrow(
        'Previous string key comments (#|) are not supported:\n> #| msgid +YJVTi'
      );
    });

    it('throws for strings with newlines', () => {
      expect(() =>
        POParser.parse(`
msgid ""
"Very long string.\n"
"Even longer string"
msgstr ""
"translation\n"
"translation_2"
`)
      ).toThrow('Multi-line strings are not supported:\n> "Very long string.');
    });
  });
});

describe('serialize', () => {
  it('serializes simple messages', () => {
    expect(
      POParser.serialize({
        messages: [
          {id: 'hello', message: 'Hello World'},
          {id: 'goodbye', message: 'Goodbye'}
        ]
      })
    ).toMatchInlineSnapshot(`
      "msgid "hello"
      msgstr "Hello World"

      msgid "goodbye"
      msgstr "Goodbye"
      "
    `);
  });

  it('serializes messages with metadata', () => {
    expect(
      POParser.serialize({
        meta: {
          'Content-Type': 'text/plain; charset=UTF-8',
          Language: 'en'
        },
        messages: [{id: 'welcome', message: 'Welcome'}]
      })
    ).toMatchInlineSnapshot(`
      "msgid ""
      msgstr ""
      "Content-Type: text/plain; charset=UTF-8\\n"
      "Language: en\\n"

      msgid "welcome"
      msgstr "Welcome"
      "
    `);
  });

  it('serializes messages with context and references', () => {
    expect(
      POParser.serialize({
        messages: [
          {
            id: 'ui.button.save',
            message: 'Save',
            description: 'Save button tooltip',
            references: [
              {path: 'src/components/Button.tsx', line: 15},
              {path: 'src/pages/Profile.tsx', line: 42}
            ]
          }
        ]
      })
    ).toMatchInlineSnapshot(`
      "#: src/components/Button.tsx:15
      #: src/pages/Profile.tsx:42
      #. Save button tooltip
      msgctxt "ui.button"
      msgid "save"
      msgstr "Save"
      "
    `);
  });

  it('serializes nested namespaces correctly', () => {
    expect(
      POParser.serialize({
        messages: [
          {id: 'ui.button.submit.text', message: 'Submit'},
          {id: 'simple.message', message: 'Hello'}
        ]
      })
    ).toMatchInlineSnapshot(`
      "msgctxt "ui.button.submit"
      msgid "text"
      msgstr "Submit"

      msgctxt "simple"
      msgid "message"
      msgstr "Hello"
      "
    `);
  });
});
