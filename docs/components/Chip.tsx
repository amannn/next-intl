import clsx from 'clsx';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  color?: 'teal' | 'orange';
};

export default function Chip({children, className, color = 'teal'}: Props) {
  return (
    <span
      className={clsx(
        className,
        'inline-block rounded-md px-2 py-[2px] text-xs font-semibold uppercase tracking-wide',
        {
          teal: 'bg-teal-100 text-teal-800',
          orange: 'bg-orange-100 text-orange-800'
        }[color]
      )}
    >
      {children}
    </span>
  );
}
