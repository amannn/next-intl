'use client';

import Link from 'next/link';
import {ComponentProps} from 'react';
import {usePathname} from 'next/navigation';

export default function NavLink({href, ...rest}: ComponentProps<typeof Link>) {
  const pathname = usePathname();
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
