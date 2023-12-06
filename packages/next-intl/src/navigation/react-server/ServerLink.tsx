import React, {ComponentProps} from 'react';
import {getLocale} from '../../server.react-server';
import {AllLocales} from '../../shared/types';
import BaseLink from '../shared/BaseLink';

type Props<Locales extends AllLocales> = Omit<
  ComponentProps<typeof BaseLink>,
  'locale'
> & {
  locale?: Locales[number];
};

export default async function ServerLink<Locales extends AllLocales>({
  locale,
  ...rest
}: Props<Locales>) {
  return <BaseLink locale={locale || (await getLocale())} {...rest} />;
}
