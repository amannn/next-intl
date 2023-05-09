import React, {ComponentProps} from 'react';
import BaseLink from '../shared/BaseLink';
import useLocale from './useLocale';

type Props = Omit<ComponentProps<typeof BaseLink>, 'locale'> & {
  locale?: string;
};

export default function Link({locale, ...rest}: Props) {
  const defaultLocale = useLocale();
  return <BaseLink locale={locale || defaultLocale} {...rest} />;
}
