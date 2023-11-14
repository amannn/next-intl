import clsx from 'clsx';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  color?: 'green' | 'yellow';
};

export default function Chip({children, className, color = 'green'}: Props) {
  return (
    <span
      className={clsx(
        className,
        'inline-block rounded-md px-[6px] py-[2px] text-xs font-semibold uppercase tracking-wider',
        {
          green:
            'bg-green-100 text-green-800 dark:bg-green-700/50 dark:text-green-100',
          yellow:
            'bg-yellow-100 text-orange-800 dark:bg-yellow-700/50 dark:text-yellow-100'
        }[color]
      )}
    >
      {children}
    </span>
  );
}
