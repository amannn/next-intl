import {NextIntlProvider, useTranslations} from 'next-intl';

// This page acts as a test environment for the TypeScript integration

function Suite() {
  /**
   * `t`
   */

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

  // Template strings
  const t = useTranslations('StrictTypes');
  function getTranslation(nestedKey: 'hello' | 'another.level') {
    return t(`nested.${nestedKey}`);
  }
  getTranslation('hello');
  getTranslation('another.level');

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

  /**
   * `t.rich`
   */

  // Correct property access
  useTranslations('StrictTypes').rich('nested.hello');
  useTranslations('StrictTypes.nested').rich('another.level');
  useTranslations('About').rich('title');
  useTranslations('About').rich('lastUpdated');
  useTranslations('Navigation').rich('about');
  useTranslations().rich('About.title');
  useTranslations().rich('Navigation.about');
  useTranslations('NotFound').rich('title');
  useTranslations('PageLayout').rich('pageTitle');

  // @ts-expect-error Trying to access a child key without a namespace
  useTranslations().rich('title');

  // @ts-expect-error Only partial namespaces are allowed
  useTranslations('About.title');

  // @ts-expect-error Trying to access a key from another namespace
  useTranslations('Test').rich('title');

  // @ts-expect-error Invalid namespace
  useTranslations('Unknown');

  // @ts-expect-error Invalid key on global namespace
  useTranslations().rich('unknown');

  // @ts-expect-error Invalid key on valid namespace
  useTranslations('About').rich('unknown');

  // @ts-expect-error Invalid namespace and invalid key
  useTranslations('unknown').rich('unknown');

  /**
   * `t.raw`
   */

  // Correct property access
  useTranslations('StrictTypes').raw('nested.hello');
  useTranslations('StrictTypes.nested').raw('another.level');
  useTranslations('About').raw('title');
  useTranslations('About').raw('lastUpdated');
  useTranslations('Navigation').raw('about');
  useTranslations().raw('About.title');
  useTranslations().raw('Navigation.about');
  useTranslations('NotFound').raw('title');
  useTranslations('PageLayout').raw('pageTitle');

  // @ts-expect-error Trying to access a child key without a namespace
  useTranslations().raw('title');

  // @ts-expect-error Only partial namespaces are allowed
  useTranslations('About.title');

  // @ts-expect-error Trying to access a key from another namespace
  useTranslations('Test').raw('title');

  // @ts-expect-error Invalid namespace
  useTranslations('Unknown');

  // @ts-expect-error Invalid key on global namespace
  useTranslations().raw('unknown');

  // @ts-expect-error Invalid key on valid namespace
  useTranslations('About').raw('unknown');

  // @ts-expect-error Invalid namespace and invalid key
  useTranslations('unknown').raw('unknown');

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
