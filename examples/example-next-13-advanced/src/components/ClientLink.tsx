'use client';

import Link from 'next-intl/link';
import {ComponentProps} from 'react';

type Props = ComponentProps<typeof Link>;

export default function ClientLink(props: Props) {
  return <Link {...props} />;
}
