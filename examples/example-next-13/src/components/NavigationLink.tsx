'use client';

import clsx from 'clsx';
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
      className={clsx(
        'inline-block py-3 px-2 transition-colors',
        isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
      )}
      href={href}
      {...rest}
    />
  );
}
