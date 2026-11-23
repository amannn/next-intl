import {UserError} from '@eloqnt/messages/_internal-codec';
import {expect, it} from 'vitest';
import prefixUserError from './prefixUserError.js';

it('formats user errors like errors thrown by next-intl itself', () => {
  const error = prefixUserError(new UserError('Codec not found')) as Error;
  expect(error.message).toBe('\n[next-intl] Codec not found\n');
  expect(error.stack).toMatch(/^Error: \n\[next-intl\] Codec not found\n/);
});

it('leaves other errors untouched', () => {
  const error = new Error('Something else');
  expect(prefixUserError(error)).toBe(error);
  expect(error.message).toBe('Something else');
});
