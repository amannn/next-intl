import {cache} from 'react';
import type {Locale} from 'use-intl/core';
import getConfig from './getConfig.js';
import getServerExtractor from './getServerExtractor.js';

// Call signature 1: `getExtracted(namespace)`
function getExtractedImpl(namespace?: string): Promise<any>;
// Call signature 2: `getExtracted({locale, namespace})`
function getExtractedImpl(opts?: {
  locale: Locale;
  namespace?: string;
}): Promise<any>;
// Implementation
async function getExtractedImpl(
  namespaceOrOpts?: string | {locale: Locale; namespace?: string}
) {
  let namespace: string | undefined;
  let locale: Locale | undefined;

  if (typeof namespaceOrOpts === 'string') {
    namespace = namespaceOrOpts;
  } else if (namespaceOrOpts) {
    locale = namespaceOrOpts.locale;
    namespace = namespaceOrOpts.namespace;
  }

  const config = await getConfig(locale);
  return getServerExtractor(config, namespace);
}

const getExtracted = cache(getExtractedImpl);
export default getExtracted;
