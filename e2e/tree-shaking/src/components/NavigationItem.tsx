'use client';

import Link from 'next/link';
import {usePathname, useSelectedLayoutSegment} from 'next/navigation';

type NavigationItemProps = {
  href: string;
  label: string;
};

export default function NavigationItem({href, label}: NavigationItemProps) {
  const selectedSegment = useSelectedLayoutSegment();
  const pathname = usePathname();
  const hrefSegments = href.split('/').filter(Boolean);
  const firstSegment = hrefSegments[0];
  const isActive =
    selectedSegment === firstSegment ||
    (href === '/' && !selectedSegment) ||
    pathname === href;

  return (
    <Link href={href} className={isActive ? 'underline' : undefined}>
      {label}
    </Link>
  );
}
