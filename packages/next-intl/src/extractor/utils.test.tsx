import {describe, expect, it} from 'vitest';
import {getSortedMessages, setNestedProperty} from './utils.js';

describe('getSortedMessages', () => {
  it('sorts by reference path', () => {
    expect(
      getSortedMessages([
        {
          id: 'a',
          message: 'a',
          references: [{path: 'components/B.tsx', line: 1}]
        },
        {
          id: 'b',
          message: 'b',
          references: [{path: 'components/A.tsx', line: 1}]
        }
      ]).map((message) => message.id)
    ).toEqual(['b', 'a']);
  });

  it('sorts by line number when reference paths match', () => {
    expect(
      getSortedMessages([
        {
          id: 'b',
          message: 'b',
          references: [{path: 'components/A.tsx', line: 20}]
        },
        {
          id: 'a',
          message: 'a',
          references: [{path: 'components/A.tsx', line: 10}]
        },
        {
          id: 'c',
          message: 'c',
          references: [{path: 'components/A.tsx', line: 30}]
        }
      ]).map((message) => message.id)
    ).toEqual(['a', 'b', 'c']);
  });

  it('preserves original order when reference paths and lines match', () => {
    expect(
      getSortedMessages([
        {
          id: 'c',
          message: 'c',
          references: [{path: 'components/A.tsx', line: 10}]
        },
        {
          id: 'a',
          message: 'a',
          references: [{path: 'components/A.tsx', line: 10}]
        },
        {
          id: 'b',
          message: 'b',
          references: [{path: 'components/A.tsx', line: 10}]
        }
      ]).map((message) => message.id)
    ).toEqual(['c', 'a', 'b']);
  });
});

describe('setNestedProperty', () => {
  it('rejects __proto__ segments (prototype pollution)', () => {
    expect(() =>
      setNestedProperty({}, '__proto__.polluted', 'x')
    ).toThrow('Invalid message id segment: __proto__');
    expect(
      (Object.prototype as unknown as {polluted?: string}).polluted
    ).toBeUndefined();
  });

  it('creates plain data properties for nested paths', () => {
    const root = Object.create(null) as Record<string, unknown>;
    setNestedProperty(root, 'a.b', 1);
    expect(Object.hasOwn(root, 'a')).toBe(true);
    expect(({} as Record<string, unknown>).b).toBeUndefined();
  });
});
