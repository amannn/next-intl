import {Button as HeadlessButton} from '@headlessui/react';
import type {ButtonProps} from '@headlessui/react';
import clsx from 'clsx';
import type {ReactElement} from 'react';

export default function Button({
  className,
  variant = 'default',
  ...props
}: ButtonProps & {
  variant?: 'outline' | 'default';
}): ReactElement {
  return (
    <HeadlessButton
      className={(args) =>
        clsx(
          'transition',
          args.focus && 'nextra-focusable',
          variant === 'outline' && [
            'border border-gray-300 dark:border-neutral-700',
            'rounded-md p-1.5'
          ],
          typeof className === 'function' ? className(args) : className
        )
      }
      {...props}
    />
  );
}
