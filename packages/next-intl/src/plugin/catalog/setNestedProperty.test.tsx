import {expect, it} from 'vitest';
import setNestedProperty from './setNestedProperty.js';

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
