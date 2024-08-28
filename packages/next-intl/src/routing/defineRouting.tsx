import {RoutingConfig} from './config';
import {Locales, Pathnames} from './types';

export default function defineRouting<
  const AppLocales extends Locales,
  const AppPathnames extends Pathnames<AppLocales> = never
>(
  config: RoutingConfig<AppLocales, AppPathnames>
): RoutingConfig<AppLocales, AppPathnames> {
  return config as RoutingConfig<AppLocales, AppPathnames>;
}
