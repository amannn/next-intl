import clsx from 'clsx';
import Link from 'next/link';
import {ComponentProps} from 'react';

type Props = ComponentProps<typeof Link>;

export default function FooterLink({children, className, ...rest}: Props) {
  return (
    <Link
      className={clsx(
        'inline-block py-3 text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
        className
      )}
      {...rest}
    >
      <p className="inline-flex items-center text-xs">{children}</p>
    </Link>
  );
}
