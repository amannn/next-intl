import React, {ComponentProps} from 'react';
import {Locales, LocalePrefixConfigVerbose} from '../../routing/types';
import {getLocale} from '../../server.react-server';
import {getLocalePrefix} from '../../shared/utils';
import BaseLink from '../shared/BaseLink';

type Props<AppLocales extends Locales> = Omit<
  ComponentProps<typeof BaseLink>,
  'locale' | 'prefix' | 'localePrefixMode'
> & {
  locale?: AppLocales[number];
  localePrefix: LocalePrefixConfigVerbose<AppLocales>;
};

export default async function ServerLink<AppLocales extends Locales>({
  locale,
  localePrefix,
  ...rest
}: Props<AppLocales>) {
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
