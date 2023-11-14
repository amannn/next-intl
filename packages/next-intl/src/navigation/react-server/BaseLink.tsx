import React, {ComponentProps} from 'react';
import useLocale from '../../react-server/useLocale';
import BaseLinkWithLocale from '../../shared/BaseLinkWithLocale';
import {AllLocales} from '../../shared/types';

type Props<Locales extends AllLocales> = Omit<
  ComponentProps<typeof BaseLinkWithLocale>,
  'locale'
> & {
  locale?: Locales[number];
};

export default function BaseLink<Locales extends AllLocales>({
  locale,
  ...rest
}: Props<Locales>) {
  const defaultLocale = useLocale();
  return <BaseLinkWithLocale locale={locale || defaultLocale} {...rest} />;
}
