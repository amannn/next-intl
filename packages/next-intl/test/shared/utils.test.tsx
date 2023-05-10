import {hasPathnamePrefixed, unlocalizePathname} from '../../src/shared/utils';

describe('hasPathnamePrefixed', () => {
  it('detects prefixed pathnames', () => {
    expect(hasPathnamePrefixed('en', '/en')).toEqual(true);
    expect(hasPathnamePrefixed('en', '/en/')).toEqual(true);
    expect(hasPathnamePrefixed('en', '/en/client')).toEqual(true);
    expect(hasPathnamePrefixed('en', '/en/client/')).toEqual(true);
    expect(hasPathnamePrefixed('en', '/en/client/test')).toEqual(true);
  });

  it('detects non-prefixed pathnames', () => {
    expect(hasPathnamePrefixed('en', '/')).toEqual(false);
    expect(hasPathnamePrefixed('en', '/client')).toEqual(false);
    expect(hasPathnamePrefixed('en', '/client/')).toEqual(false);
    expect(hasPathnamePrefixed('en', '/client/test')).toEqual(false);
  });
});

describe('unlocalizePathname', () => {
  it('works for the root', () => {
    expect(unlocalizePathname('/en', 'en')).toEqual('/');
  });

  it('works for nested pages', () => {
    expect(unlocalizePathname('/en/nested', 'en')).toEqual('/nested');
  });

  it('works with sub-tags', () => {
    expect(unlocalizePathname('/en-UK/nested', 'en-UK')).toEqual('/nested');
  });
});
