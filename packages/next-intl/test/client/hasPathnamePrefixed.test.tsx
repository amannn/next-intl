import hasPathnamePrefixed from '../../src/client/hasPathnamePrefixed';

it('works', () => {
  expect(hasPathnamePrefixed('en', '/en')).toEqual(true);
  expect(hasPathnamePrefixed('en', '/en/client')).toEqual(true);
  expect(hasPathnamePrefixed('en', '/client')).toEqual(false);
});
