import {cache} from 'react';
import type {
  Locale,
  Messages,
  NamespaceKeys,
  NestedKeyOf,
  createTranslator
} from 'use-intl/core';
import getConfig from './getConfig.js';
import getServerTranslator from './getServerTranslator.js';

// Maintainer note: `getTranslations` has two different call signatures.
// We need to define these with function overloads, otherwise TypeScript
// messes up the return type.

// Call signature 1: `getTranslations(namespace)`
function getTranslations<
  NestedKey extends NamespaceKeys<Messages, NestedKeyOf<Messages>> = never
>(
  namespace?: NestedKey
): Promise<ReturnType<typeof createTranslator<Messages, NestedKey>>>;
// Call signature 2: `getTranslations({locale, namespace})`
function getTranslations<
  NestedKey extends NamespaceKeys<Messages, NestedKeyOf<Messages>> = never
>(opts?: {
  locale: Locale;
  namespace?: NestedKey;
}): Promise<ReturnType<typeof createTranslator<Messages, NestedKey>>>;
// Implementation
async function getTranslations<
  NestedKey extends NamespaceKeys<Messages, NestedKeyOf<Messages>> = never
>(namespaceOrOpts?: NestedKey | {locale: Locale; namespace?: NestedKey}) {
  let namespace: NestedKey | undefined;
  let locale: Locale | undefined;

  if (typeof namespaceOrOpts === 'string') {
    namespace = namespaceOrOpts;
  } else if (namespaceOrOpts) {
    locale = namespaceOrOpts.locale;
    namespace = namespaceOrOpts.namespace;
  }

  const config = await getConfig(locale);
  return getServerTranslator(config, namespace);
}

export default cache(getTranslations);
