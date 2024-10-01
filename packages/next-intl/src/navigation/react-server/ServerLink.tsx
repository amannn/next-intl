import React, {ComponentProps} from 'react';
import {
  Locales,
  LocalePrefixConfigVerbose,
  LocalePrefixMode
} from '../../routing/types';
import {getLocale} from '../../server.react-server';
import {getLocalePrefix} from '../../shared/utils';
import LegacyBaseLink from '../shared/LegacyBaseLink';

// Only used by legacy navigation APIs, can be removed when they are removed

type Props<
  AppLocales extends Locales,
  AppLocalePrefixMode extends LocalePrefixMode
> = Omit<
  ComponentProps<typeof LegacyBaseLink>,
  'locale' | 'prefix' | 'localePrefixMode'
> & {
  locale?: AppLocales[number];
  localePrefix: LocalePrefixConfigVerbose<AppLocales, AppLocalePrefixMode>;
};

export default async function ServerLink<
  AppLocales extends Locales,
  AppLocalePrefixMode extends LocalePrefixMode
>({locale, localePrefix, ...rest}: Props<AppLocales, AppLocalePrefixMode>) {
  const finalLocale = locale || (await getLocale());
  const prefix = getLocalePrefix(finalLocale, localePrefix);

  return (
    <LegacyBaseLink
      locale={finalLocale}
      localePrefixMode={localePrefix.mode}
      prefix={prefix}
      {...rest}
    />
  );
}
