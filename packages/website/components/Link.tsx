import NextLink from 'next/link';
import {ComponentProps} from 'react';

type Props = Omit<ComponentProps<typeof NextLink>, 'className'>;

export default function Link(props: Props) {
  return (
    <NextLink
      className="text-sky-600 underline underline-offset-2 transition-colors hover:text-sky-700"
      {...props}
    />
  );
}
