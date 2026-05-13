import {describe, expect, it, vi} from 'vitest';
import {getSortedMessages, setNestedProperty} from './utils.js';

describe('getSortedMessages', () => {
  it('sorts by reference path', () => {
    expect(
      getSortedMessages([
        {
          description: [],
          id: 'a',
          message: 'a',
          references: [{path: 'components/B.tsx', line: 1}]
        },
        {
          description: [],
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
          description: [],
          id: 'b',
          message: 'b',
          references: [{path: 'components/A.tsx', line: 20}]
        },
        {
          description: [],
          id: 'a',
          message: 'a',
          references: [{path: 'components/A.tsx', line: 10}]
        },
        {
          description: [],
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
          description: [],
          id: 'c',
          message: 'c',
          references: [{path: 'components/A.tsx', line: 10}]
        },
        {
          description: [],
          id: 'a',
          message: 'a',
          references: [{path: 'components/A.tsx', line: 10}]
        },
        {
          description: [],
          id: 'b',
          message: 'b',
          references: [{path: 'components/A.tsx', line: 10}]
        }
      ]).map((message) => message.id)
    ).toEqual(['c', 'a', 'b']);
  });

  it('preserves original order and warns when a reference is missing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(
      getSortedMessages([
        {
          description: [],
          id: 'a',
          message: 'a',
          references: []
        },
        {
          description: [],
          id: 'b',
          message: 'b',
          references: [{path: 'components/A.tsx', line: 1}]
        }
      ]).map((message) => message.id)
    ).toEqual(['a', 'b']);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Missing file reference for extracted message: a')
    );

    warnSpy.mockRestore();
  });
});

describe('setNestedProperty', () => {
  it('rejects __proto__ segments (prototype pollution)', () => {
    expect(() => setNestedProperty({}, '__proto__.polluted', 'x')).toThrow(
      'Invalid message id segment: __proto__'
    );
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
