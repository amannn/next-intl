import {useTranslations, GlobalMessages} from 'next-intl';

const foo: GlobalMessages = {};
console.log(foo.About.lastUpdated);

export default function Test() {
  // Correct property access
  useTranslations()('About.title');
  useTranslations('About')('title');
  useTranslations('About')('nested.hello');
  useTranslations('About.nested')('hello');

  // @ts-expect-error Only partial namespaces are allowed
  useTranslations('About.title');

  // @ts-expect-error Invalid namespace
  useTranslations('Unknown');

  // @ts-expect-error Invalid key on global namespace
  useTranslations()('unknown');

  // @ts-expect-error Invalid key on valid namespace
  useTranslations('About')('unknown');

  // @ts-expect-error Invalid namespace and invalid key
  useTranslations('unknown')('unknown');
}
