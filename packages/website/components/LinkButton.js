import clsx from 'clsx';
import Link from 'next/link';

export default function LinkButton({variant = 'primary', ...rest}) {
  return (
    <Link
      className={clsx(
        'inline-block rounded-full py-2 px-4 text-base font-semibold transition-colors lg:py-4 lg:px-8',
        variant === 'primary'
          ? 'bg-slate-800 text-white hover:bg-slate-700 dark:bg-primary dark:text-slate-900 dark:hover:bg-sky-200'
          : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-white/90 dark:hover:bg-slate-700'
      )}
      {...rest}
    />
  );
}
