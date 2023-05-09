import React, {ComponentProps} from 'react';
import useClientLocale from '../client/useClientLocale';
import BaseLink from '../shared/BaseLink';

type Props = ComponentProps<typeof BaseLink>;

export default function Link(props: Props) {
  const defaultLocale = useClientLocale();
  return <BaseLink locale={defaultLocale} {...props} />;
}
