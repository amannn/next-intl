import React, {ComponentProps} from 'react';
import NextIntlClientProvider_ from '../shared/NextIntlClientProvider';

let hasWarned = false;
/** @deprecated Should be imported from `next-intl`, not `next-intl/client`. */
export default function NextIntlClientProvider(
  props: ComponentProps<typeof NextIntlClientProvider_>
) {
  if (!hasWarned) {
    hasWarned = true;
    console.warn(`
Importing \`NextIntlClientProvider\` from \`next-intl/client\` is deprecated. Please update the import:

  import {NextIntlClientProvider} from 'next-intl';
`);
  }
  return <NextIntlClientProvider_ {...props} />;
}
