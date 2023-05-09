import unlocalizePathname from '../../src/shared/unlocalizePathname';

it('works for the root', () => {
  expect(unlocalizePathname('/en', 'en')).toEqual('/');
});

it('works for nested pages', () => {
  expect(unlocalizePathname('/en/nested', 'en')).toEqual('/nested');
});

it('works with sub-tags', () => {
  expect(unlocalizePathname('/en-UK/nested', 'en-UK')).toEqual('/nested');
});
