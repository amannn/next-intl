import React, {ComponentProps} from 'react';
import Link from '../link/react-server';

// TODO: Only available for backwards compatibility
// during the beta, remove for stable release

let hasWarned = false;

/** @deprecated Is available as `import Link from 'next-intl/link'` now. */
export default function LinkDeprecated(props: ComponentProps<typeof Link>) {
  if (process.env.NODE_ENV !== 'production' && !hasWarned) {
    console.warn(
      `\n\nDEPRECATION WARNING: The import for \`Link\` from next-intl has changed.

Previously: import {Link} from 'next-intl';
Now:        import Link from 'next-intl/link';

Please upgrade your import accordingly. See also https://next-intl-docs.vercel.app/docs/routing/navigation#link\n\n`
    );
    hasWarned = true;
  }

  return <Link {...props} />;
}
