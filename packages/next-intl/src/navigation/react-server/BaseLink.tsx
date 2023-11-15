import React, {ComponentProps} from 'react';
import {getLocale} from '../../server';
import BaseLinkWithLocale from '../../shared/BaseLinkWithLocale';
import {AllLocales} from '../../shared/types';

type Props<Locales extends AllLocales> = Omit<
  ComponentProps<typeof BaseLinkWithLocale>,
  'locale'
> & {
  locale?: Locales[number];
};

export default async function BaseLink<Locales extends AllLocales>({
  locale,
  ...rest
}: Props<Locales>) {
  return (
    <BaseLinkWithLocale locale={locale || (await getLocale())} {...rest} />
  );
}
