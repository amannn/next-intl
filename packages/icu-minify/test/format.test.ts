import {describe, expect, it} from 'vitest';
import {compile} from '../src/compiler.js';
import {format} from '../src/format.js';

describe('format', () => {
  describe('static text', () => {
    it('formats empty string', () => {
      expect(format('', 'en')).toBe('');
    });

    it('formats plain text', () => {
      expect(format('Hello world', 'en')).toBe('Hello world');
    });

    it('formats unicode content', () => {
      expect(format('こんにちは 🌍', 'ja')).toBe('こんにちは 🌍');
    });
  });

  describe('simple arguments', () => {
    it('formats single argument', () => {
      const compiled = compile('{name}');
      expect(format(compiled, 'en', {name: 'World'})).toBe('World');
    });

    it('formats text with argument', () => {
      const compiled = compile('Hello {name}');
      expect(format(compiled, 'en', {name: 'World'})).toBe('Hello World');
    });

    it('formats multiple arguments', () => {
      const compiled = compile('{first} {last}');
      expect(format(compiled, 'en', {first: 'John', last: 'Doe'})).toBe(
        'John Doe'
      );
    });

    it('converts numbers to strings', () => {
      const compiled = compile('Value: {val}');
      expect(format(compiled, 'en', {val: 42})).toBe('Value: 42');
    });

    it('converts booleans to strings', () => {
      const compiled = compile('Active: {active}');
      expect(format(compiled, 'en', {active: true})).toBe('Active: true');
    });

    it('throws for missing argument', () => {
      const compiled = compile('Hello {name}');
      expect(() => format(compiled, 'en', {})).toThrow(
        'Missing value for argument "name"'
      );
    });

    it('ignores extra arguments', () => {
      const compiled = compile('Hello {name}');
      expect(
        format(compiled, 'en', {name: 'World', extra: 'ignored'})
      ).toBe('Hello World');
    });
  });

  describe('escaping', () => {
    it('formats escaped braces', () => {
      const compiled = compile("'{name}'");
      expect(format(compiled, 'en')).toBe('{name}');
    });

    it('formats escaped single quotes', () => {
      const compiled = compile("It''s working");
      expect(format(compiled, 'en')).toBe("It's working");
    });

    it('formats mixed escaped and unescaped', () => {
      const compiled = compile("'{name}' is {name}");
      expect(format(compiled, 'en', {name: 'test'})).toBe('{name} is test');
    });
  });

  describe('number formatting', () => {
    it('formats plain number', () => {
      const compiled = compile('{val, number}');
      expect(format(compiled, 'en', {val: 1234.5})).toBe('1,234.5');
    });

    it('formats number with German locale', () => {
      const compiled = compile('{val, number}');
      expect(format(compiled, 'de', {val: 1234.5})).toBe('1.234,5');
    });

    it('formats percent', () => {
      const compiled = compile('{val, number, percent}');
      expect(format(compiled, 'en', {val: 0.75})).toBe('75%');
    });

    it('throws for non-number value', () => {
      const compiled = compile('{val, number}');
      expect(() => format(compiled, 'en', {val: 'abc'})).toThrow(
        'Expected number'
      );
    });
  });

  describe('date formatting', () => {
    const date = new Date('2024-03-15T14:30:00Z');

    it('formats date with short style', () => {
      const compiled = compile('{d, date, short}');
      // Note: exact output depends on locale and timezone
      const result = format(compiled, 'en', {d: date});
      expect(typeof result).toBe('string');
      expect(result).toContain('3');
      expect(result).toContain('15');
    });

    it('formats date with medium style', () => {
      const compiled = compile('{d, date, medium}');
      const result = format(compiled, 'en', {d: date});
      expect(typeof result).toBe('string');
    });

    it('formats date from timestamp', () => {
      const compiled = compile('{d, date, short}');
      const result = format(compiled, 'en', {d: date.getTime()});
      expect(typeof result).toBe('string');
    });
  });

  describe('time formatting', () => {
    const date = new Date('2024-03-15T14:30:00Z');

    it('formats time with short style', () => {
      const compiled = compile('{t, time, short}');
      const result = format(compiled, 'en', {t: date});
      expect(typeof result).toBe('string');
    });

    it('formats time with medium style', () => {
      const compiled = compile('{t, time, medium}');
      const result = format(compiled, 'en', {t: date});
      expect(typeof result).toBe('string');
    });
  });

  describe('select', () => {
    it('selects matching branch', () => {
      const compiled = compile(
        '{gender, select, female {She} male {He} other {They}}'
      );
      expect(format(compiled, 'en', {gender: 'female'})).toBe('She');
      expect(format(compiled, 'en', {gender: 'male'})).toBe('He');
    });

    it('falls back to other', () => {
      const compiled = compile(
        '{gender, select, female {She} male {He} other {They}}'
      );
      expect(format(compiled, 'en', {gender: 'unknown'})).toBe('They');
    });

    it('formats arguments in branches', () => {
      const compiled = compile(
        '{gender, select, female {{name} is a woman} other {{name} is a person}}'
      );
      expect(format(compiled, 'en', {gender: 'female', name: 'Alice'})).toBe(
        'Alice is a woman'
      );
    });
  });

  describe('cardinal plural', () => {
    it('formats plural with one/other', () => {
      const compiled = compile('{count, plural, one {# item} other {# items}}');
      expect(format(compiled, 'en', {count: 1})).toBe('1 item');
      expect(format(compiled, 'en', {count: 5})).toBe('5 items');
      expect(format(compiled, 'en', {count: 0})).toBe('0 items');
    });

    it('uses exact matches over plural rules', () => {
      const compiled = compile(
        '{count, plural, =0 {no items} =1 {one item} one {# item} other {# items}}'
      );
      expect(format(compiled, 'en', {count: 0})).toBe('no items');
      expect(format(compiled, 'en', {count: 1})).toBe('one item');
      expect(format(compiled, 'en', {count: 2})).toBe('2 items');
    });

    it('formats pound sign with locale', () => {
      const compiled = compile(
        '{count, plural, one {# item} other {# items}}'
      );
      expect(format(compiled, 'de', {count: 1000})).toBe('1.000 items');
    });

    it('handles zero category in Arabic', () => {
      const compiled = compile(
        '{count, plural, zero {no items} one {item} two {two items} few {few items} many {many items} other {# items}}'
      );
      // Arabic has special plural rules
      expect(format(compiled, 'ar', {count: 0})).toBe('no items');
    });

    it('throws for non-number value', () => {
      const compiled = compile('{count, plural, one {# item} other {# items}}');
      expect(() => format(compiled, 'en', {count: 'abc'})).toThrow(
        'Expected number'
      );
    });
  });

  describe('plural with offset', () => {
    it('applies offset to pound sign', () => {
      const compiled = compile(
        '{guests, plural, offset:1 =0 {no one} =1 {{host}} one {{host} and one guest} other {{host} and # guests}}'
      );
      expect(format(compiled, 'en', {guests: 0, host: 'Alice'})).toBe('no one');
      expect(format(compiled, 'en', {guests: 1, host: 'Alice'})).toBe('Alice');
      expect(format(compiled, 'en', {guests: 2, host: 'Alice'})).toBe(
        'Alice and one guest'
      );
      expect(format(compiled, 'en', {guests: 5, host: 'Alice'})).toBe(
        'Alice and 4 guests'
      );
    });
  });

  describe('ordinal plural (selectordinal)', () => {
    it('formats ordinals in English', () => {
      const compiled = compile(
        '{n, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}'
      );
      expect(format(compiled, 'en', {n: 1})).toBe('1st');
      expect(format(compiled, 'en', {n: 2})).toBe('2nd');
      expect(format(compiled, 'en', {n: 3})).toBe('3rd');
      expect(format(compiled, 'en', {n: 4})).toBe('4th');
      expect(format(compiled, 'en', {n: 11})).toBe('11th');
      expect(format(compiled, 'en', {n: 21})).toBe('21st');
      expect(format(compiled, 'en', {n: 22})).toBe('22nd');
      expect(format(compiled, 'en', {n: 23})).toBe('23rd');
      expect(format(compiled, 'en', {n: 100})).toBe('100th');
    });
  });

  describe('tags', () => {
    it('calls tag handler with children', () => {
      const compiled = compile('<bold>important</bold>');
      const result = format(compiled, 'en', {
        bold: (chunks) => `<b>${chunks.join('')}</b>`
      });
      expect(result).toBe('<b>important</b>');
    });

    it('handles tag with argument', () => {
      const compiled = compile('<link>{name}</link>');
      const result = format(compiled, 'en', {
        name: 'Click here',
        link: (chunks) => `<a>${chunks.join('')}</a>`
      });
      expect(result).toBe('<a>Click here</a>');
    });

    it('supports tags returning non-strings', () => {
      const compiled = compile('Hello <bold>{name}</bold>');
      const boldElement = {type: 'bold', children: ['World']};
      const result = format(compiled, 'en', {
        name: 'World',
        bold: () => boldElement
      });
      expect(result).toEqual(['Hello ', boldElement]);
    });

    it('supports nested tags returning JSX-like objects', () => {
      interface TagElement {
        tag: string;
        children: Array<string | TagElement>;
      }
      const compiled = compile('<a><b>text</b></a>');
      const result = format<TagElement>(compiled, 'en', {
        b: (chunks) => ({tag: 'b', children: chunks}),
        a: (chunks) => ({tag: 'a', children: chunks})
      });
      // The result is an array because the top-level contains a non-string
      expect(result).toEqual([
        {tag: 'a', children: [{tag: 'b', children: ['text']}]}
      ]);
    });

    it('throws for missing tag handler', () => {
      const compiled = compile('<bold>text</bold>');
      expect(() => format(compiled, 'en', {})).toThrow(
        'Missing value for argument "bold"'
      );
    });

    it('throws for non-function tag handler', () => {
      const compiled = compile('<bold>text</bold>');
      expect(() => format(compiled, 'en', {bold: 'not a function'})).toThrow(
        'Expected function for tag handler'
      );
    });
  });

  describe('nesting', () => {
    it('formats select inside plural', () => {
      // Note: # inside a select is treated as literal text per ICU spec
      const compiled = compile(
        '{count, plural, one {{gender, select, female {her item} other {their item}}} other {{gender, select, female {her items} other {their items}}}}'
      );
      expect(format(compiled, 'en', {count: 1, gender: 'female'})).toBe(
        'her item'
      );
      expect(format(compiled, 'en', {count: 1, gender: 'male'})).toBe(
        'their item'
      );
      expect(format(compiled, 'en', {count: 5, gender: 'female'})).toBe(
        'her items'
      );
    });

    it('formats plural inside select', () => {
      const compiled = compile(
        '{gender, select, female {{n, plural, one {She has # cat} other {She has # cats}}} other {{n, plural, one {They have # cat} other {They have # cats}}}}'
      );
      expect(format(compiled, 'en', {gender: 'female', n: 1})).toBe(
        'She has 1 cat'
      );
      expect(format(compiled, 'en', {gender: 'female', n: 3})).toBe(
        'She has 3 cats'
      );
      expect(format(compiled, 'en', {gender: 'other', n: 1})).toBe(
        'They have 1 cat'
      );
    });

    it('formats deeply nested structures', () => {
      const compiled = compile(
        '{a, select, x {{b, plural, one {{c, select, y {deep} other {nested}}} other {level}}} other {top}}'
      );
      expect(format(compiled, 'en', {a: 'x', b: 1, c: 'y'})).toBe('deep');
      expect(format(compiled, 'en', {a: 'x', b: 1, c: 'z'})).toBe('nested');
      expect(format(compiled, 'en', {a: 'x', b: 2, c: 'y'})).toBe('level');
      expect(format(compiled, 'en', {a: 'z', b: 1, c: 'y'})).toBe('top');
    });

    it('formats pound at different nesting levels', () => {
      const compiled = compile(
        '{outer, plural, one {{inner, plural, one {#-#} other {#-#s}}} other {{inner, plural, one {#s-#} other {#s-#s}}}}'
      );
      // Note: # references the innermost plural context
      expect(format(compiled, 'en', {outer: 1, inner: 1})).toBe('1-1');
      expect(format(compiled, 'en', {outer: 1, inner: 2})).toBe('2-2s');
      expect(format(compiled, 'en', {outer: 2, inner: 1})).toBe('1s-1');
      expect(format(compiled, 'en', {outer: 2, inner: 2})).toBe('2s-2s');
    });
  });

  describe('locales', () => {
    it('formats with English locale', () => {
      const compiled = compile('{count, plural, one {# item} other {# items}}');
      expect(format(compiled, 'en', {count: 1})).toBe('1 item');
    });

    it('formats with German locale', () => {
      const compiled = compile('{count, plural, one {# Artikel} other {# Artikel}}');
      expect(format(compiled, 'de', {count: 1000})).toBe('1.000 Artikel');
    });

    it('uses Polish plural rules', () => {
      // Polish has complex plural rules: 1 = one, 2-4 = few, 5-21 = many, 22-24 = few, etc.
      const compiled = compile(
        '{n, plural, one {# plik} few {# pliki} many {# plików} other {# pliku}}'
      );
      expect(format(compiled, 'pl', {n: 1})).toBe('1 plik');
      expect(format(compiled, 'pl', {n: 2})).toBe('2 pliki');
      expect(format(compiled, 'pl', {n: 5})).toBe('5 plików');
      expect(format(compiled, 'pl', {n: 22})).toBe('22 pliki');
    });

    it('uses Russian plural rules', () => {
      // Russian: 1 = one, 2-4 = few, 5-20 = many, 21 = one, 22-24 = few
      const compiled = compile(
        '{n, plural, one {# файл} few {# файла} many {# файлов} other {# файла}}'
      );
      expect(format(compiled, 'ru', {n: 1})).toBe('1 файл');
      expect(format(compiled, 'ru', {n: 2})).toBe('2 файла');
      expect(format(compiled, 'ru', {n: 5})).toBe('5 файлов');
      expect(format(compiled, 'ru', {n: 21})).toBe('21 файл');
    });
  });

  describe('edge cases', () => {
    it('handles empty message', () => {
      expect(format('', 'en')).toBe('');
    });

    it('handles only whitespace', () => {
      expect(format('   ', 'en')).toBe('   ');
    });

    it('handles very long messages', () => {
      const longText = 'x'.repeat(10000);
      expect(format(longText, 'en')).toBe(longText);
    });

    it('handles Date objects for simple arguments', () => {
      const compiled = compile('Date: {d}');
      const date = new Date('2024-01-01');
      const result = format(compiled, 'en', {d: date});
      expect(typeof result).toBe('string');
      expect(result).toContain('2024');
    });

    it('handles null values', () => {
      const compiled = compile('Value: {val}');
      expect(format(compiled, 'en', {val: null})).toBe('Value: null');
    });

    it('handles undefined values', () => {
      const compiled = compile('Value: {val}');
      expect(format(compiled, 'en', {val: undefined})).toBe('Value: undefined');
    });
  });

  describe('integration - compile and format', () => {
    it('handles real-world example: shopping cart', () => {
      const message =
        '{itemCount, plural, =0 {Your cart is empty} one {You have # item in your cart} other {You have # items in your cart}}';
      const compiled = compile(message);

      expect(format(compiled, 'en', {itemCount: 0})).toBe('Your cart is empty');
      expect(format(compiled, 'en', {itemCount: 1})).toBe(
        'You have 1 item in your cart'
      );
      expect(format(compiled, 'en', {itemCount: 5})).toBe(
        'You have 5 items in your cart'
      );
    });

    it('handles real-world example: greeting with gender', () => {
      const message =
        '{gender, select, female {Dear Ms. {lastName}} male {Dear Mr. {lastName}} other {Dear {firstName} {lastName}}}';
      const compiled = compile(message);

      expect(
        format(compiled, 'en', {
          gender: 'female',
          firstName: 'Jane',
          lastName: 'Doe'
        })
      ).toBe('Dear Ms. Doe');
      expect(
        format(compiled, 'en', {
          gender: 'male',
          firstName: 'John',
          lastName: 'Doe'
        })
      ).toBe('Dear Mr. Doe');
      expect(
        format(compiled, 'en', {
          gender: 'other',
          firstName: 'Alex',
          lastName: 'Smith'
        })
      ).toBe('Dear Alex Smith');
    });

    it('handles real-world example: rich text with formatting', () => {
      const message = 'Welcome, <bold>{name}</bold>! You have <link>{count, plural, one {# message} other {# messages}}</link>.';
      const compiled = compile(message);

      const result = format(compiled, 'en', {
        name: 'Alice',
        count: 5,
        bold: (chunks: Array<unknown>) => `<strong>${chunks.join('')}</strong>`,
        link: (chunks: Array<unknown>) => `<a href="/messages">${chunks.join('')}</a>`
      });

      expect(result).toBe(
        'Welcome, <strong>Alice</strong>! You have <a href="/messages">5 messages</a>.'
      );
    });
  });
});
