import React, {ComponentProps} from 'react';
import BaseLink from '../shared/BaseLink';
import useLocale from './useLocale';

type Props = ComponentProps<typeof BaseLink>;

export default function Link(props: Props) {
  const defaultLocale = useLocale();
  return <BaseLink locale={defaultLocale} {...props} />;
}
