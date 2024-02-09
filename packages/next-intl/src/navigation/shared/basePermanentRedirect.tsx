import {permanentRedirect as nextpermanentRedirect} from 'next/navigation';
import {
  AllLocales,
  LocalePrefix,
  ParametersExceptFirst
} from '../../shared/types';
import {prefixPathname} from '../../shared/utils';

export default function basePermanentRedirect(
  params: {
    pathname: string;
    locale: AllLocales[number];
    localePrefix?: LocalePrefix;
  },
  ...args: ParametersExceptFirst<typeof nextpermanentRedirect>
) {
  const localizedPathname =
    params.localePrefix === 'never'
      ? params.pathname
      : prefixPathname(params.locale, params.pathname);
  return nextpermanentRedirect(localizedPathname, ...args);
}
