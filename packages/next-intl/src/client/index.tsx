/**
 * Client-only APIs.
 */

import React, {ComponentProps} from 'react';
import NextIntlClientProvider_ from '../shared/NextIntlClientProvider';
import usePathname from './usePathname';
import useRouter from './useRouter';

export {default as useRouter} from './useRouter';
export {default as usePathname} from './usePathname';

// TODO: Remove before stable release

let hasWarnedForPathname = false;
export function useLocalizedPathname() {
  if (!hasWarnedForPathname) {
    console.warn(
      'DEPRECATION WARNING: `useLocalizedPathname` has been renamed to `usePathname` - please update your import statement.'
    );
    hasWarnedForPathname = true;
  }
  return usePathname();
}

let hasWarnedForRouter = false;
export function useLocalizedRouter() {
  if (!hasWarnedForRouter) {
    console.warn(
      'DEPRECATION WARNING: `useLocalizedRouter` has been renamed to `useRouter` - please update your import statement.'
    );
    hasWarnedForRouter = true;
  }
  return useRouter();
}

let hasWarnedForProvider = false;
export function NextIntlClientProvider(
  props: ComponentProps<typeof NextIntlClientProvider_>
) {
  if (!hasWarnedForProvider) {
    console.warn(
      'DEPRECATION WARNING: `NextIntlClientProvider` should be imported from `next-intl`, not `next-intl/client` - please update your import statement.'
    );
    hasWarnedForProvider = true;
  }

  return <NextIntlClientProvider_ {...props} />;
}
