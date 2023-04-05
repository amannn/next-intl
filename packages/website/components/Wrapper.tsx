import clsx from 'clsx';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  className?: string;
};

export default function Wrapper({children, className}: Props) {
  return (
    <div className={clsx(className, 'relative mx-auto max-w-[95rem] px-4')}>
      {children}
    </div>
  );
}
