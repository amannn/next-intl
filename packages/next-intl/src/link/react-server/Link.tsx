import React, {ComponentProps} from 'react';
import useLocale from '../../react-server/useLocale';
import BaseLink from '../../shared/BaseLink';
import {AllLocales} from '../../shared/types';

type Props<Locales extends AllLocales> = Omit<
  ComponentProps<typeof BaseLink>,
  'locale'
> & {
  locale?: Locales[number];
};

export default function Link<Locales extends AllLocales>({
  locale,
  ...rest
}: Props<Locales>) {
  const defaultLocale = useLocale();
  return <BaseLink locale={locale || defaultLocale} {...rest} />;
}
