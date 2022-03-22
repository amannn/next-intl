import {useTranslations} from 'next-intl';

// This page acts as a test environment for the TypeScript integration

const foo: GlobalMessages = {};
console.log(foo.About.lastUpdated);

// const jan: Jan = {
//   Test: 'sdf'
// };

const globalJan: GlobalJan = {
  hello: 'sdf'
};

export default function Test() {
  // Correct property access
  useTranslations()('About.title');
  useTranslations('Test')('nested.hello');
  useTranslations('Test.nested')('another.level');
  // TODO: As soon as About.nested is gone (or renamed), this is an error :(
  useTranslations('About')('title');

  useTranslations('About')('lastUpdated');

  useTranslations('Navigation')('about');

  // useTranslations()('Navigation.about');
  // useTranslations('Navigation')('index');

  useTranslations()('Navigation.about');
  useTranslations('Navigation')('about');
  useTranslations('NotFound')('title');
  useTranslations('PageLayout')('pageTitle');

  // @ts-expect-error Trying to access a child key without a namespace
  useTranslations()('title');

  // @ts-expect-error Only partial namespaces are allowed
  useTranslations('About.title');

  // @ts-expect-error Trying to access a key from another namespace
  useTranslations('Test')('title');

  // @ts-expect-error Invalid namespace
  useTranslations('Unknown');

  // @ts-expect-error Invalid key on global namespace
  useTranslations()('unknown');

  // @ts-expect-error Invalid key on valid namespace
  useTranslations('About')('unknown');

  // @ts-expect-error Invalid namespace and invalid key
  useTranslations('unknown')('unknown');
}
