/**
 * Client-only APIs.
 */

import React, {ComponentProps} from 'react';
import NextIntlClientProvider_ from '../shared/NextIntlClientProvider';

export {default as useLocalizedRouter} from './useLocalizedRouter';
export {default as useUnlocalizedPathname} from './useUnlocalizedPathname';

let hasWarned = false;
export function NextIntlClientProvider(
  props: ComponentProps<typeof NextIntlClientProvider_>
) {
  if (!hasWarned) {
    console.warn(
      'DEPRECATION WARNING: `NextIntlClientProvider` should be imported from `next-intl`, not `next-intl/client` - please update your import statement.'
    );
    hasWarned = true;
  }

  return <NextIntlClientProvider_ {...props} />;
}
