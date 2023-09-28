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
  useTranslations as base_useTranslations,
  useFormatter as base_useFormatter
} from 'use-intl';

export * from 'use-intl';

// eslint-disable-next-line @typescript-eslint/ban-types
function callHook(name: string, hook: Function) {
  return (...args: Array<unknown>) => {
    try {
      return hook(...args);
    } catch (e) {
      throw new Error(
        process.env.NODE_ENV !== 'production'
          ? `Failed to call \`${name}\`, because the context from \`NextIntlClientProvider\` was not found.\n\nLearn more about this error here: https://next-intl-docs.vercel.app/docs/environments/server-client-components#missing-context`
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

// Replace `useLocale` export from `use-intl`
export {default as useLocale} from './useLocale';

export {default as NextIntlClientProvider} from '../shared/NextIntlClientProvider';
