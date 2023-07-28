'use client';

import {useSelectedLayoutSegment} from 'next/navigation';
import {ComponentProps} from 'react';
import {Link} from '../navigation';

type Props = ComponentProps<typeof Link>;

export default function NavigationLink({href, ...rest}: Props) {
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
