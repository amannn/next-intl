import cx from 'clsx';
import NextLink from 'next/link';
import {ReactNode} from 'react';

type Props = {
  children?: ReactNode;
  title: string;
  arrow?: boolean;
  href: string;
};

export default function Card({arrow, children, href, title, ...props}: Props) {
  return (
    <NextLink
      className={cx(
        'group flex flex-col justify-start overflow-hidden rounded-lg border border-gray-200',
        'text-current no-underline dark:shadow-none',
        'hover:shadow-gray-100 dark:hover:shadow-none shadow-gray-100',
        'active:shadow-sm active:shadow-gray-200',
        'transition-all duration-200 hover:border-gray-300',
        'bg-transparent shadow-sm dark:border-neutral-800 hover:bg-slate-50 hover:shadow-md dark:hover:border-neutral-700 dark:hover:bg-neutral-900 p-4'
      )}
      href={href}
      {...props}
    >
      <span
        className={cx(
          'flex font-semibold items-start gap-2 text-gray-700 hover:text-gray-900',
          'dark:text-neutral-200 dark:hover:text-neutral-50 flex items-center'
        )}
      >
        {title}
        {arrow && (
          <span className="transition-transform duration-75 group-hover:translate-x-[2px]">
            →
          </span>
        )}
      </span>
      {children && <div className="mt-3">{children}</div>}
    </NextLink>
  );
}
