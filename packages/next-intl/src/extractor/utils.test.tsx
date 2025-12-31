import {describe, expect, it} from 'vitest';
import {getSortedMessages} from './utils.js';

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
