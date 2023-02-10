/**
 * This is the main entry file when non-'react-server' environments import
 * from 'next-intl'. Make sure this mirrors the API from 'react-server'.
 */

import React, {ComponentProps} from 'react';
import Link from './shared/Link';

export * from 'use-intl';

export {default as useLocalizedRouter} from './react-client/useLocalizedRouter';
export {default as Link} from './shared/Link';
export {default as NextIntlClientProvider} from './shared/NextIntlClientProvider';

// DEPRECATED: Legacy export for compatibility
export {default as NextIntlProvider} from './shared/NextIntlClientProvider';

// TODO: Remove before stable release
let hasWarned = false;
export function LocalizedLink(props: ComponentProps<typeof Link>) {
  if (!hasWarned) {
    hasWarned = true;
    console.warn(
      'The `LocalizedLink` component has been renamed to `Link`. Please update your imports.'
    );
  }
  return <Link {...props} />;
}
