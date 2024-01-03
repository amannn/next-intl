// @ts-ignore -- Only available after build
import {_getRequestLocale as getRequestLocale} from 'next-intl/server';
import {LocalePrefix, ParametersExceptFirst} from '../../shared/types';
import baseRedirect from '../shared/baseRedirect';

export default function serverRedirect(
  params: {pathname: string; localePrefix?: LocalePrefix},
  ...args: ParametersExceptFirst<typeof baseRedirect>
) {
  const locale = getRequestLocale();
  return baseRedirect({...params, locale}, ...args);
}
