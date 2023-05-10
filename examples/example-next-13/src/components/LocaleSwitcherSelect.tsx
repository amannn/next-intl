'use client';

import {useRouter} from 'next/navigation';
import {usePathname} from 'next-intl/client';
import {ChangeEvent, ComponentProps} from 'react';

type Props = ComponentProps<'select'>;

export default function LocaleSwitcherSelect(props: Props) {
  const router = useRouter();
  const pathname = usePathname();

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    router.replace(`/${event.target.value}${pathname}`);
  }

  return <select {...props} onChange={onSelectChange} />;
}
