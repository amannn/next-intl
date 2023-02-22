import Link from 'next/link';
import clsx from 'clsx';

export default function LinkButton({ variant = 'primary', ...rest }) {
  return (
    <Link
      className={clsx(
        'rounded-full py-4 px-8 text-base font-semibold transition-colors',
        variant === 'primary'
          ? 'bg-primary text-slate-900 hover:bg-sky-200'
          : 'bg-slate-800 text-white hover:bg-slate-700'
      )}
      {...rest}
    />
  );
}
