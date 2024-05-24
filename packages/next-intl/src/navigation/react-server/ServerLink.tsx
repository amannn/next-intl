import React, {ComponentProps} from 'react';
import {getLocale} from '../../server.react-server';
import {AllLocales, RoutingLocales} from '../../shared/types';
import BaseLink from '../shared/BaseLink';
import {getLocalePrefix} from '../shared/utils';

type Props<Locales extends AllLocales> = Omit<
  ComponentProps<typeof BaseLink>,
  'locale' | 'prefix'
> & {
  locale?: Locales[number];
  locales?: RoutingLocales<Locales>;
};

export default async function ServerLink<Locales extends AllLocales>({
  locale,
  locales,
  ...rest
}: Props<Locales>) {
  const finalLocale = locale || (await getLocale());
  const prefix = getLocalePrefix(finalLocale, locales);

  return <BaseLink locale={finalLocale} prefix={prefix} {...rest} />;
}
