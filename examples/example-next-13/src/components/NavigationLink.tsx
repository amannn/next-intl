'use client';

import clsx from 'clsx';
import {Link} from 'next-intl';
import {usePathname} from 'next-intl/client';
import {ComponentProps} from 'react';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
};

export default function NavigationLink({href, ...rest}: Props) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      aria-current={isActive}
      className={clsx(
        'inline-block py-3 px-2 transition-colors',
        isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
      )}
      href={href}
      {...rest}
    />
  );
}
