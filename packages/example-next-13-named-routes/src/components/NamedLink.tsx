import {Link, useLocale} from 'next-intl';
import {ComponentProps} from 'react';
import routes from '../../routes.json';

type Routes =
  | {
      name: 'home';
      params?: never;
    }
  | {
      name: 'detail';
      params: {slug: string};
    };

type Props = Omit<ComponentProps<typeof Link>, 'href'> & Routes;

export default function NamedLink({name, params, ...rest}: Props) {
  const locale = useLocale();

  const localeRoutes = (routes as any)[locale];
  if (!localeRoutes) {
    throw new Error(`No routes found for locale "${locale}"`);
  }

  const routePath = (localeRoutes as any)[name];
  if (!routePath) {
    throw new Error(`No route found for name "${name}"`);
  }

  let href = routePath;
  if (params) {
    Object.keys(params).forEach((param) => {
      href = href.replace(new RegExp(':' + param, 'g'), (params as any)[param]);
    });
  }

  return <Link href={href} {...rest} />;
}
