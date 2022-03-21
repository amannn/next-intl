import {useTranslations} from 'next-intl';

export default function Test() {
  // Correct property access
  useTranslations()('About.title');
  useTranslations('About')('title');
  useTranslations('About')('nested.hello');
  useTranslations('About.nested')('hello');
  useTranslations('B')('c');

  useTranslations()('About.something');
  useTranslations('About')('something');

  useTranslations('About')('lastUpdated');

  // @ts-expect-error Trying access a child key without a namespace
  useTranslations()('e');

  // @ts-expect-error Only partial namespaces are allowed
  useTranslations('About.title');

  // @ts-expect-error Trying to access a key from another namespace
  useTranslations('B')('title');

  // @ts-expect-error Invalid namespace
  useTranslations('Unknown');

  // @ts-expect-error Invalid key on global namespace
  useTranslations()('unknown');

  // @ts-expect-error Invalid key on valid namespace
  useTranslations('About')('unknown');

  // @ts-expect-error Invalid namespace and invalid key
  useTranslations('unknown')('unknown');
}
