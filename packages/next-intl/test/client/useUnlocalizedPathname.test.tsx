import {unlocalizePathname} from '../../src/client/useUnlocalizedPathname';

it('works for the root', () => {
  expect(unlocalizePathname('/en')).toEqual('/');
});

it("works if there's no pathname", () => {
  expect(unlocalizePathname(null)).toEqual(null);
});

it('works for nested pages', () => {
  expect(unlocalizePathname('/en/nested')).toEqual('/nested');
});

it('works with sub-tags', () => {
  expect(unlocalizePathname('/en-UK/nested')).toEqual('/nested');
});
