'use client';

import {ComponentProps} from 'react';
import {Link} from '../navigation';

type Props = ComponentProps<typeof Link>;

export default function ClientLink(props: Props) {
  return <Link {...props} />;
}
