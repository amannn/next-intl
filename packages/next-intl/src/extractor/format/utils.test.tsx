import {describe, expect, it} from 'vitest';
import {getSortedMessages} from './utils.js';

describe('getSortedMessages', () => {
  it('sorts by reference path', () => {
    expect(
      getSortedMessages([
        {
          id: 'a',
          message: 'a',
          references: [{path: 'components/B.tsx'}]
        },
        {
          id: 'b',
          message: 'b',
          references: [{path: 'components/A.tsx'}]
        }
      ]).map((message) => message.id)
    ).toEqual(['b', 'a']);
  });

  it('uses message ids to break ties when reference paths match', () => {
    expect(
      getSortedMessages([
        {
          id: 'c',
          message: 'b',
          references: [{path: 'components/B.tsx'}]
        },
        {
          id: 'b',
          message: 'a',
          references: [{path: 'components/A.tsx'}]
        },
        {
          id: 'a',
          message: 'c',
          references: [{path: 'components/A.tsx'}]
        }
      ]).map((message) => message.id)
    ).toEqual(['a', 'b', 'c']);
  });
});
