import {describe, it, expect} from 'vitest';
import {compile} from '../src/compiler.js';
import {
  TYPE_SELECT,
  TYPE_PLURAL,
  TYPE_SELECTORDINAL,
  TYPE_FORMAT,
  TYPE_TAG
} from '../src/types.js';

describe('compile', () => {
  describe('static text', () => {
    it('compiles empty string', () => {
      expect(compile('')).toBe('');
    });

    it('compiles plain text', () => {
      expect(compile('Hello world')).toBe('Hello world');
    });

    it('compiles text with whitespace', () => {
      expect(compile('  Hello  world  ')).toBe('  Hello  world  ');
    });

    it('compiles unicode content', () => {
      expect(compile('こんにちは 🌍')).toBe('こんにちは 🌍');
    });
  });

  describe('escaping', () => {
    it('escapes single brace', () => {
      expect(compile("'{'"  )).toBe('{');
    });

    it('escapes closing brace', () => {
      expect(compile("'}'"  )).toBe('}');
    });

    it('escapes braces around text', () => {
      expect(compile("'{name}'"  )).toBe('{name}');
    });

    it('escapes single quotes', () => {
      expect(compile("It''s working")).toBe("It's working");
    });

    it('handles mixed escaped and unescaped', () => {
      const result = compile("'{name}' is {name}");
      expect(result).toEqual(['{name} is ', ['name']]);
    });
  });

  describe('simple arguments', () => {
    it('compiles single argument', () => {
      const result = compile('{name}');
      expect(result).toEqual([['name']]);
    });

    it('compiles text with argument', () => {
      const result = compile('Hello {name}');
      expect(result).toEqual(['Hello ', ['name']]);
    });

    it('compiles argument with text', () => {
      const result = compile('{name}, welcome!');
      expect(result).toEqual([['name'], ', welcome!']);
    });

    it('compiles multiple arguments', () => {
      const result = compile('{first} {last}');
      expect(result).toEqual([['first'], ' ', ['last']]);
    });

    it('compiles arguments in different positions', () => {
      const result = compile('Dear {title} {name}, your order #{orderId} is ready.');
      expect(result).toEqual([
        'Dear ',
        ['title'],
        ' ',
        ['name'],
        ', your order #',
        ['orderId'],
        ' is ready.'
      ]);
    });
  });

  describe('number formatting', () => {
    it('compiles plain number', () => {
      const result = compile('{val, number}');
      expect(result).toEqual([['val', TYPE_FORMAT, 'number']]);
    });

    it('compiles percent style', () => {
      const result = compile('{val, number, percent}');
      expect(result).toEqual([['val', TYPE_FORMAT, 'number', 'percent']]);
    });

    it('compiles integer style', () => {
      const result = compile('{val, number, integer}');
      expect(result).toEqual([['val', TYPE_FORMAT, 'number', 'integer']]);
    });
  });

  describe('date formatting', () => {
    it('compiles plain date', () => {
      const result = compile('{date, date}');
      expect(result).toEqual([['date', TYPE_FORMAT, 'date']]);
    });

    it('compiles short date', () => {
      const result = compile('{date, date, short}');
      expect(result).toEqual([['date', TYPE_FORMAT, 'date', 'short']]);
    });

    it('compiles medium date', () => {
      const result = compile('{date, date, medium}');
      expect(result).toEqual([['date', TYPE_FORMAT, 'date', 'medium']]);
    });

    it('compiles long date', () => {
      const result = compile('{date, date, long}');
      expect(result).toEqual([['date', TYPE_FORMAT, 'date', 'long']]);
    });

    it('compiles full date', () => {
      const result = compile('{date, date, full}');
      expect(result).toEqual([['date', TYPE_FORMAT, 'date', 'full']]);
    });
  });

  describe('time formatting', () => {
    it('compiles plain time', () => {
      const result = compile('{time, time}');
      expect(result).toEqual([['time', TYPE_FORMAT, 'time']]);
    });

    it('compiles short time', () => {
      const result = compile('{time, time, short}');
      expect(result).toEqual([['time', TYPE_FORMAT, 'time', 'short']]);
    });

    it('compiles medium time', () => {
      const result = compile('{time, time, medium}');
      expect(result).toEqual([['time', TYPE_FORMAT, 'time', 'medium']]);
    });
  });

  describe('select', () => {
    it('compiles simple select', () => {
      const result = compile('{gender, select, female {She} male {He} other {They}}');
      expect(result).toEqual([
        ['gender', TYPE_SELECT, {female: 'She', male: 'He', other: 'They'}]
      ]);
    });

    it('compiles select with arguments in branches', () => {
      const result = compile('{gender, select, female {{name} is her name} other {{name} is their name}}');
      expect(result).toEqual([
        [
          'gender',
          TYPE_SELECT,
          {
            female: [['name'], ' is her name'],
            other: [['name'], ' is their name']
          }
        ]
      ]);
    });

    it('throws for select without other', () => {
      expect(() => compile('{gender, select, female {She} male {He}}')).toThrow();
    });
  });

  describe('cardinal plural', () => {
    it('compiles simple plural', () => {
      const result = compile('{count, plural, one {item} other {items}}');
      expect(result).toEqual([
        ['count', TYPE_PLURAL, {one: 'item', other: 'items'}]
      ]);
    });

    it('compiles plural with pound sign', () => {
      const result = compile('{count, plural, one {# item} other {# items}}');
      expect(result).toEqual([
        ['count', TYPE_PLURAL, {one: [0, ' item'], other: [0, ' items']}]
      ]);
    });

    it('compiles plural with exact matches', () => {
      const result = compile('{count, plural, =0 {no items} =1 {one item} other {# items}}');
      expect(result).toEqual([
        [
          'count',
          TYPE_PLURAL,
          {'=0': 'no items', '=1': 'one item', other: [0, ' items']}
        ]
      ]);
    });

    it('compiles plural with offset', () => {
      const result = compile('{guests, plural, offset:1 =0 {no one} =1 {just {host}} one {{host} and one guest} other {{host} and # guests}}');
      expect(result).toEqual([
        [
          'guests',
          TYPE_PLURAL,
          [
            {
              '=0': 'no one',
              '=1': ['just ', ['host']],
              one: [['host'], ' and one guest'],
              other: [['host'], ' and ', 0, ' guests']
            },
            1
          ]
        ]
      ]);
    });

    it('throws for plural without other', () => {
      expect(() => compile('{count, plural, one {item}}')).toThrow();
    });
  });

  describe('ordinal plural (selectordinal)', () => {
    it('compiles simple ordinal', () => {
      const result = compile('{n, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}');
      expect(result).toEqual([
        [
          'n',
          TYPE_SELECTORDINAL,
          {one: [0, 'st'], two: [0, 'nd'], few: [0, 'rd'], other: [0, 'th']}
        ]
      ]);
    });

    it('compiles ordinal with text', () => {
      const result = compile('You are the {place, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} person');
      expect(result).toEqual([
        'You are the ',
        [
          'place',
          TYPE_SELECTORDINAL,
          {one: [0, 'st'], two: [0, 'nd'], few: [0, 'rd'], other: [0, 'th']}
        ],
        ' person'
      ]);
    });
  });

  describe('tags', () => {
    it('compiles simple tag', () => {
      const result = compile('<bold>important</bold>');
      expect(result).toEqual([['bold', TYPE_TAG, 'important']]);
    });

    it('compiles tag with argument', () => {
      const result = compile('<bold>{name}</bold>');
      expect(result).toEqual([['bold', TYPE_TAG, ['name']]]);
    });

    it('compiles multiple tags', () => {
      const result = compile('<a>link</a> and <b>bold</b>');
      expect(result).toEqual([
        ['a', TYPE_TAG, 'link'],
        ' and ',
        ['b', TYPE_TAG, 'bold']
      ]);
    });

    it('compiles nested content in tags', () => {
      const result = compile('<wrapper>Hello <bold>{name}</bold></wrapper>');
      expect(result).toEqual([
        ['wrapper', TYPE_TAG, 'Hello ', ['bold', TYPE_TAG, ['name']]]
      ]);
    });

    it('compiles tags around plural', () => {
      const result = compile('<bold>{count, plural, one {# item} other {# items}}</bold>');
      expect(result).toEqual([
        ['bold', TYPE_TAG, ['count', TYPE_PLURAL, {one: [0, ' item'], other: [0, ' items']}]]
      ]);
    });
  });

  describe('nesting', () => {
    it('compiles select inside plural', () => {
      // Note: # inside a select (even when nested in plural) is treated as literal text per ICU spec
      const result = compile(
        '{count, plural, one {{gender, select, female {her item} other {their item}}} other {{gender, select, female {her items} other {their items}}}}'
      );
      expect(result).toEqual([
        [
          'count',
          TYPE_PLURAL,
          {
            one: [
              'gender',
              TYPE_SELECT,
              {female: 'her item', other: 'their item'}
            ],
            other: [
              'gender',
              TYPE_SELECT,
              {female: 'her items', other: 'their items'}
            ]
          }
        ]
      ]);
    });

    it('compiles plural inside select', () => {
      const result = compile(
        '{gender, select, female {{n, plural, one {She has # cat} other {She has # cats}}} other {{n, plural, one {They have # cat} other {They have # cats}}}}'
      );
      expect(result).toEqual([
        [
          'gender',
          TYPE_SELECT,
          {
            female: [
              'n',
              TYPE_PLURAL,
              {
                one: ['She has ', 0, ' cat'],
                other: ['She has ', 0, ' cats']
              }
            ],
            other: [
              'n',
              TYPE_PLURAL,
              {
                one: ['They have ', 0, ' cat'],
                other: ['They have ', 0, ' cats']
              }
            ]
          }
        ]
      ]);
    });
  });

  describe('invalid syntax', () => {
    it('throws for unclosed brace', () => {
      expect(() => compile('{name')).toThrow();
    });

    it('throws for missing argument name', () => {
      expect(() => compile('{}')).toThrow();
    });

    it('throws for unclosed tag', () => {
      expect(() => compile('<bold>text')).toThrow();
    });
  });
});
