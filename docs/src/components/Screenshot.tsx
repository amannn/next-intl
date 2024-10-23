import clsx from 'clsx';
import Image from 'next/image';
import {ComponentProps} from 'react';

type Props = ComponentProps<typeof Image>;

export default function Screenshot({className, ...rest}: Props) {
  return (
    <Image className={clsx(className, 'rounded-md shadow-lg')} {...rest} />
  );
}
