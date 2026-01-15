import compile from 'icu-minify/compiler';
import {isValidElement} from 'react';
import {expect, it, vi} from 'vitest';
import createTranslator from './createTranslator.js';

vi.mock('use-intl/format-message', async () => {
  const formatOnly = await import('./format-message/format-only.js');
  return {
    ...formatOnly,
    default: vi.fn(formatOnly.default)
  };
});

function getTranslator(message: string) {
  return createTranslator({
    locale: 'en',
    messages: {message: compile(message)}
  });
}

it('can handle a plain message', async () => {
  const t = getTranslator('Hello');
  expect(t('message')).toBe('Hello');
});

it('can handle an argument', async () => {
  const t = getTranslator('Hello {param}');
  expect(t('message', {param: 'World'})).toBe('Hello World');
});

it('can handle markup text', async () => {
  const t = getTranslator('<b>Hello {param}</b>');
  expect(
    t.markup('message', {
      param: 'World',
      b: (chunks) => `<b>${chunks}</b>`
    })
  ).toBe('<b>Hello World</b>');
});

it('can handle rich text', async () => {
  const t = getTranslator('<b>Hello {param}</b>');
  const result = t.rich('message', {
    param: 'World',
    b: (chunks) => <b>{chunks}</b>
  });
  expect(isValidElement(result)).toBe(true);
  expect(typeof result).toBe('object');
  expect(result).toMatchInlineSnapshot(`
    <b>
      Hello World
    </b>
  `);
});
