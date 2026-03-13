/* eslint-disable @typescript-eslint/no-unused-expressions */
import {describe, it} from 'vitest';
import getExtracted from './getExtracted.js';

describe('type tests', () => {
  it('returns a function to be called with a string', () => {
    async () => {
      const t = await getExtracted();
      t('Hello');

      // @ts-expect-error -- Invalid type
      t(123);
    };
  });

  it('can receive values', () => {
    async () => {
      const t = await getExtracted();
      t('Hello {name}', {name: 'World'});

      // @ts-expect-error -- Missing values
      t('Hello {name}');

      // @ts-expect-error -- Invalid type
      t('Hello {name}', 123);
    };
  });

  it('accepts an object form', () => {
    async () => {
      const t = await getExtracted();
      t({message: 'Hello {name}', values: {name: 'World'}});

      // @ts-expect-error -- Missing message
      t({values: {name: 'World'}});

      // @ts-expect-error -- Missing values
      t({message: 'Hello {name}'});

      // @ts-expect-error -- Invalid type
      t({message: 'Hello {name}', values: {name: 123}});

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
