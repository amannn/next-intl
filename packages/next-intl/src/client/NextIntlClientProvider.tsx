import React, {ComponentProps} from 'react';
import NextIntlClientProvider_ from '../shared/NextIntlClientProvider';

let hasWarned = false;
/** @deprecated Should be imported from `next-intl`, not `next-intl/client`. */
export default function NextIntlClientProvider(
  props: ComponentProps<typeof NextIntlClientProvider_>
) {
  if (!hasWarned) {
    hasWarned = true;
    console.warn(
      'DEPRECATION WARNING: Importing `NextIntlClientProvider` from `next-intl/client` is deprecated. ' +
        'Please import it from `next-intl` instead.'
    );
  }
  return <NextIntlClientProvider_ {...props} />;
}
