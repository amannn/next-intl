import {IntlMessageFormat} from 'intl-messageformat';
import {expect, it} from 'vitest';
import defaultFormats from './defaultFormats.js';

it('matches the built-in formats of `intl-messageformat`', () => {
  expect(defaultFormats).toEqual(IntlMessageFormat.formats);
});
