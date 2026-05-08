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

  it('breaks ties by id when reference paths and lines match', () => {
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
    ).toEqual(['a', 'b', 'c']);
  });

  it('produces a stable order regardless of input order when some messages have no references', () => {
    // Reproduces the non-transitive comparator bug: messages without
    // references could land on either side of their referenced neighbors
    // depending on the input order, producing spurious catalog diffs.
    const messages = [
      {
        id: 'UVkKe5',
        message: 'Sending code...',
        references: [{path: 'auth.ts', line: 50}]
      },
      {id: 'nx5jYc', message: 'Send sign-in code'},
      {
        id: 'abc123',
        message: 'Welcome',
        references: [{path: 'auth.ts', line: 10}]
      },
      {id: 'zzz999', message: 'Goodbye'},
      {
        id: 'def456',
        message: 'Login',
        references: [{path: 'home.ts', line: 5}]
      }
    ];

    const shuffled = [
      messages[3],
      messages[0],
      messages[4],
      messages[1],
      messages[2]
    ];

    const sortedA = getSortedMessages(messages).map((m) => m.id);
    const sortedB = getSortedMessages(shuffled).map((m) => m.id);

    expect(sortedA).toEqual(sortedB);
    // Referenced messages first (by path, then line), then reference-less
    // messages (by id).
    expect(sortedA).toEqual(['abc123', 'UVkKe5', 'def456', 'nx5jYc', 'zzz999']);
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
