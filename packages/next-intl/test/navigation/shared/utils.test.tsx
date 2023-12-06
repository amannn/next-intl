import {describe, expect, it} from 'vitest';
import {
  compileLocalizedPathname,
  serializeSearchParams
} from '../../../src/navigation/shared/utils';

describe('serializeSearchParams', () => {
  it('handles strings', () => {
    expect(serializeSearchParams({v: 'test'})).toEqual('?v=test');
  });

  it('handles numbers', () => {
    expect(serializeSearchParams({v: 2})).toEqual('?v=2');
  });

  it('handles booleans', () => {
    expect(serializeSearchParams({v: true})).toEqual('?v=true');
  });

  it('handles arrays', () => {
    expect(serializeSearchParams({v: ['a', 'b']})).toEqual('?v=a&v=b');
  });
});

describe('compileLocalizedPathname', () => {
  it('throws when params were not resolved', () => {
    const locales: ReadonlyArray<string> = ['en'];
    expect(() =>
      // @ts-expect-error -- Purposefully miss a param
      compileLocalizedPathname<typeof locales, '/test/[one]/[two]'>({
        locale: 'en',
        pathname: '/test/[one]/[two]',
        pathnames: '/test/[one]/[two]',
        params: {one: '1'}
      })
    ).toThrow(
      [
        'Insufficient params provided for localized pathname.',
        'Template: /test/[one]/[two]',
        'Params: {"one":"1"}'
      ].join('\n')
    );
  });
});
