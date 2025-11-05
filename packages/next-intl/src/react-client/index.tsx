/**
 * This is the main entry file when non-'react-server'
 * environments import from 'next-intl'.
 *
 * Maintainer notes:
 * - Make sure this mirrors the API from 'react-server'.
 * - Make sure everything exported from this module is
 *   supported in all Next.js versions that are supported.
 */

import {
  useFormatter as base_useFormatter,
  useTranslations as base_useTranslations
} from 'use-intl';

export * from 'use-intl';
export {_useExtracted as useExtracted} from 'use-intl/react';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function callHook(name: string, hook: Function) {
  return (...args: Array<unknown>) => {
    try {
      return hook(...args);
    } catch {
      throw new Error(
        process.env.NODE_ENV !== 'production'
          ? `Failed to call \`${name}\` because the context from \`NextIntlClientProvider\` was not found.

This can happen because:
1) You intended to render this component as a Server Component, the render
   failed, and therefore React attempted to render the component on the client
   instead. If this is the case, check the console for server errors.
2) You intended to render this component on the client side, but no context was found.
   Learn more about this error here: https://next-intl.dev/docs/environments/server-client-components#missing-context`
          : undefined
      );
    }
  };
}

export const useTranslations = callHook(
  'useTranslations',
  base_useTranslations
) as typeof base_useTranslations;
export const useFormatter = callHook(
  'useFormatter',
  base_useFormatter
) as typeof base_useFormatter;

export {default as NextIntlClientProvider} from '../shared/NextIntlClientProvider.js';
