'use client';

import {Link} from '@/navigation.public';
import {ComponentProps} from 'react';
import {useSelectedLayoutSegment} from 'next/navigation';

export default function NavLink({href, ...rest}: ComponentProps<typeof Link>) {
  const selectedLayoutSegment = useSelectedLayoutSegment();
  const pathname = selectedLayoutSegment ? `/${selectedLayoutSegment}` : '/';
  const isActive = pathname === href;

  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      href={href}
      className={isActive ? 'font-semibold' : undefined}
      {...rest}
    />
  );
}
