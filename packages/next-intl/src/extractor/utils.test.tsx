import {describe, expect, it, vi} from 'vitest';
import {setNestedProperty, warnAboutMissingReferences} from './utils.js';

describe('warnAboutMissingReferences', () => {
  it('warns once per message id without a reference', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    warnAboutMissingReferences([
      {
        description: [],
        id: 'a',
        message: 'a',
        references: [{path: 'components/A.tsx', line: 1}]
      },
      {description: [], id: 'b', message: 'b', references: []},
      {description: [], id: 'b', message: 'b', references: []}
    ]);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy.mock.calls[0][0]).toContain(
      'Missing file reference for extracted message: b'
    );
    consoleSpy.mockRestore();
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
