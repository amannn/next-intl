'use client';

import {usePathname} from '../../../navigation';

export default function UnlocalizedPathname() {
  return <p data-testid="UnlocalizedPathname">{usePathname()}</p>;
}
