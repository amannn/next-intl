import {useTranslations} from 'next-intl';

// This page acts as a test environment for the TypeScript integration

export default function Test() {
  // Correct property access
  useTranslations()('About.title');
  useTranslations('About')('title');
  useTranslations('About')('nested.hello');
  useTranslations('Test')('nested.hello');
  useTranslations('Test.nested')('another.level');

  // @ts-expect-error Trying access a child key without a namespace
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
