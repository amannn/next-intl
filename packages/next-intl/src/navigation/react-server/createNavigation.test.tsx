import {describe, expect, it, vi} from 'vitest';
import createNavigation from './createNavigation';

vi.mock('react');

const {usePathname, useRouter} = createNavigation();

describe('usePathname', () => {
  it('should throw an error', () => {
    expect(() => {
      usePathname();
    }).toThrowError(
      '`usePathname` is not supported in Server Components. You can use this hook if you convert the calling component to a Client Component.'
    );
  });
});

describe('useRouter', () => {
  it('should throw an error', () => {
    expect(() => {
      useRouter();
    }).toThrowError(
      '`useRouter` is not supported in Server Components. You can use this hook if you convert the calling component to a Client Component.'
    );
  });
});
