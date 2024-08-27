import {RoutingConfig} from './config';
import {Locales, Pathnames} from './types';

export default function defineRouting<
  const AppLocales extends Locales,
  const AppPathnames extends Pathnames<AppLocales> | undefined = undefined
>(config: {
  locales: AppLocales;
  defaultLocale: AppLocales[number];
  pathnames?: AppPathnames;
  domains?: RoutingConfig<AppLocales, AppPathnames>['domains'];
  localePrefix?: RoutingConfig<AppLocales, AppPathnames>['localePrefix'];
}): RoutingConfig<AppLocales, AppPathnames> {
  // https://discord.com/channels/997886693233393714/1278008400533520434
  return config as RoutingConfig<AppLocales, AppPathnames>;
}
