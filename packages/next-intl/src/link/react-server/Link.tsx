import React, {ComponentProps} from 'react';
import useLocale from '../../react-server/useLocale';
import BaseLink from '../../shared/BaseLink';

type Props = Omit<ComponentProps<typeof BaseLink>, 'locale'> & {
  locale?: string;
};

export default function Link({locale, ...rest}: Props) {
  const defaultLocale = useLocale();
  return <BaseLink locale={locale || defaultLocale} {...rest} />;
}
