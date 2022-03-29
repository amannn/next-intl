import {NextIntlProvider, useTranslations} from 'next-intl';

// This page acts as a test environment for the TypeScript integration

function Suite() {
  // Correct property access
  useTranslations('StrictTypes')('nested.hello');
  useTranslations('StrictTypes.nested')('another.level');
  useTranslations('About')('title');
  useTranslations('About')('lastUpdated');
  useTranslations('Navigation')('about');
  useTranslations()('About.title');
  useTranslations()('Navigation.about');
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

  return <>Suite passed</>;
}

export default function Test() {
  function onError() {
    // No-op
  }

  return (
    <NextIntlProvider messages={{}} onError={onError}>
      <Suite />
    </NextIntlProvider>
  );
}
