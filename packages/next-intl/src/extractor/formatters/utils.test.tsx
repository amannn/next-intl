import {describe, expect, it} from 'vitest';
import type {ExtractedMessage} from '../types.js';
import {getSortedMessages} from './utils.js';

describe('getSortedMessages', () => {
  it('uses message ids to break ties when reference paths match', () => {
    const messages: Array<ExtractedMessage> = [
      {id: 'beta', message: '', references: [{path: 'components/Footer.tsx'}]},
      {id: 'alpha', message: '', references: [{path: 'components/Footer.tsx'}]},
      {id: 'gamma', message: '', references: [{path: 'components/Header.tsx'}]}
    ];

    const sorted = getSortedMessages(messages).map((message) => message.id);

    expect(sorted).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('sorts by id when messages share the same inferred path', () => {
    const messages: Array<ExtractedMessage> = [
      {id: 'beta', message: ''},
      {id: 'alpha', message: ''}
    ];

    const sorted = getSortedMessages(messages).map((message) => message.id);

    expect(sorted).toEqual(['alpha', 'beta']);
  });
});
