'use client';

import {ComponentProps} from 'react';
import {Link, Pathnames} from '@/navigation';

export default function NavigationLink<Pathname extends Pathnames>(
  props: ComponentProps<typeof Link<Pathname>>
) {
  return <Link {...props} />;
}
