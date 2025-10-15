import clsx from 'clsx';
import Link from 'next/link';
import {ComponentProps} from 'react';

type Props = {
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'md' | 'lg';
} & Omit<ComponentProps<typeof Link>, 'className'>;

export default function LinkButton({
  children,
  className,
  size = 'md',
  variant = 'primary',
  ...rest
}: Props) {
  return (
    <Link
      className={clsx(
        className,
        'group inline-block font-semibold transition-colors',
        size === 'lg'
          ? 'rounded-full px-4 py-2 text-base lg:px-8 lg:py-4'
          : 'rounded-lg px-3 py-1.5 text-sm',
        variant === 'primary'
          ? 'bg-slate-800 text-white hover:bg-slate-700 dark:bg-primary-400 dark:text-slate-900 dark:hover:bg-sky-200'
          : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-white/90 dark:hover:bg-slate-700'
      )}
      {...rest}
    >
      {children}
      <span
        className={clsx(
          'ml-2 inline-block transition-transform',
          size === 'lg'
            ? 'group-hover:translate-x-1'
            : 'group-hover:translate-x-0.5'
        )}
      >
        →
      </span>
    </Link>
  );
}
