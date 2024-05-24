'use client';

import {ComponentProps} from 'react';
import {pathnames} from '../config';
import {Link} from '../navigation';

export default function NavigationLink<Pathname extends keyof typeof pathnames>(
  props: ComponentProps<typeof Link<Pathname>>
) {
  return <Link {...props} />;
}
