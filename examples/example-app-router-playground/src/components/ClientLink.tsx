'use client';

import {ComponentProps} from 'react';
import {Link, pathnames} from '@/navigation';

export default function NavigationLink<Pathname extends keyof typeof pathnames>(
  props: ComponentProps<typeof Link<Pathname>>
) {
  return <Link {...props} />;
}
