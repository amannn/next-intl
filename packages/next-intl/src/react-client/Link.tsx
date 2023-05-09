import React, {ComponentProps} from 'react';
import {useLocale} from 'use-intl';
import BaseLink from '../shared/BaseLink';

type Props = ComponentProps<typeof BaseLink>;

export default function Link(props: Props) {
  const defaultLocale = useLocale();
  return <BaseLink locale={defaultLocale} {...props} />;
}
