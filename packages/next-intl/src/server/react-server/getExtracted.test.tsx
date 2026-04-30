/* eslint-disable @typescript-eslint/no-unused-expressions */
import {describe, it} from 'vitest';
import getExtracted from './getExtracted.js';

describe('type tests', () => {
  it('returns a function to be called with a string', () => {
    async () => {
      const t = await getExtracted();
      t('Hello');
    };
  });

  it('can receive values', () => {
    async () => {
      const t = await getExtracted();
      t('Hello {name}', {name: 'World'});
    };
  });

  it('accepts an object form', () => {
    async () => {
      const t = await getExtracted();

      t({message: 'Hello {name}', values: {name: 'World'}});

      t({
        message: 'Hello'
      });

      t({
        id: 'greeting',
        message: 'Hello'
      });

      t({
        id: 'greeting',
        message: 'Hello',
        description: 'Greeting message'
      });
    };
  });
});
