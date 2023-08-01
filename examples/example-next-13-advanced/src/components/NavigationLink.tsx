'use client';

import {useSelectedLayoutSegment} from 'next/navigation';
import {ComponentProps} from 'react';
import {Link} from '../navigation';

type Props = ComponentProps<typeof Link>;

function NavigationLink({href, ...rest}: Props) {
  const selectedLayoutSegment = useSelectedLayoutSegment();
  const pathname = selectedLayoutSegment ? `/${selectedLayoutSegment}` : '/';
  const isActive = pathname === href;

  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      href={href}
      style={{textDecoration: isActive ? 'underline' : 'none'}}
      {...rest}
    />
  );
}

// Make sure the generic type of `Link` is preserved.
export default NavigationLink as typeof Link;
