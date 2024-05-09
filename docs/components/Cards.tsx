import cx from 'clsx';
import type {ComponentProps} from 'react';

type Props = ComponentProps<'div'>;

export default function Cards({children, className, ...props}: Props) {
  return (
    <div className={cx('flex flex-col gap-4', className)} {...props}>
      {children}
    </div>
  );
}
