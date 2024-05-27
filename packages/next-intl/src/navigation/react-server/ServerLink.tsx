import React, {ComponentProps} from 'react';
import {getLocale} from '../../server.react-server';
import {AllLocales, LocalePrefixConfigVerbose} from '../../shared/types';
import {getLocalePrefix} from '../../shared/utils';
import BaseLink from '../shared/BaseLink';

type Props<Locales extends AllLocales> = Omit<
  ComponentProps<typeof BaseLink>,
  'locale' | 'prefix' | 'localePrefixMode'
> & {
  locale?: Locales[number];
  localePrefix: LocalePrefixConfigVerbose<Locales>;
};

export default async function ServerLink<Locales extends AllLocales>({
  locale,
  localePrefix,
  ...rest
}: Props<Locales>) {
  const finalLocale = locale || (await getLocale());
  const prefix = getLocalePrefix(finalLocale, localePrefix);

  return (
    <BaseLink
      locale={finalLocale}
      localePrefixMode={localePrefix.mode}
      prefix={prefix}
      {...rest}
    />
  );
}
