import Link from 'next/link';
import {ComponentProps} from 'react';

type Props = ComponentProps<typeof Link>;

export default function FooterLink({children, ...rest}: Props) {
  return (
    <Link
      className="inline-block py-3 text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      {...rest}
    >
      <p className="inline-flex items-center text-xs">{children}</p>
    </Link>
  );
}
