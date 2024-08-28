import {RoutingConfig} from './config';
import {Locales, Pathnames} from './types';

export default function defineRouting<
  const AppLocales extends Locales,
  const AppPathnames extends Pathnames<AppLocales> = never
>(config: RoutingConfig<AppLocales, AppPathnames>) {
  return config;
}
