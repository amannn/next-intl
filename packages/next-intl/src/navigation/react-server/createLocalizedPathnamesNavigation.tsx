import React, {ComponentProps} from 'react';
import {getRequestLocale} from '../../server/react-server/RequestLocale';
import {
  AllLocales,
  LocalePrefixConfig,
  ParametersExceptFirst,
  Pathnames
} from '../../shared/types';
import {receiveLocalePrefixConfig} from '../../shared/utils';
import {
  HrefOrHrefWithParams,
  HrefOrUrlObjectWithParams,
  compileLocalizedPathname,
  normalizeNameOrNameWithParams
} from '../shared/utils';
import ServerLink from './ServerLink';
import {serverPermanentRedirect, serverRedirect} from './redirects';

export default function createLocalizedPathnamesNavigation<
  Locales extends AllLocales,
  PathnamesConfig extends Pathnames<Locales>
>(opts: {
  locales: Locales;
  pathnames: Pathnames<Locales>;
  localePrefix?: LocalePrefixConfig<Locales>;
}) {
  const finalLocalePrefix = receiveLocalePrefixConfig(opts?.localePrefix);

  type LinkProps<Pathname extends keyof PathnamesConfig> = Omit<
    ComponentProps<typeof ServerLink>,
    'href' | 'name' | 'localePrefix'
  > & {
    href: HrefOrUrlObjectWithParams<Pathname>;
    locale?: Locales[number];
  };
  function Link<Pathname extends keyof PathnamesConfig>({
    href,
    locale,
    ...rest
  }: LinkProps<Pathname>) {
    const defaultLocale = getRequestLocale() as (typeof opts.locales)[number];
    const finalLocale = locale || defaultLocale;

    return (
      <ServerLink
        href={compileLocalizedPathname<Locales, Pathname>({
          locale: finalLocale,
          // @ts-expect-error -- This is ok
          pathname: href,
          // @ts-expect-error -- This is ok
          params: typeof href === 'object' ? href.params : undefined,
          pathnames: opts.pathnames
        })}
        locale={locale}
        localePrefix={finalLocalePrefix}
        {...rest}
      />
    );
  }

  function redirect<Pathname extends keyof PathnamesConfig>(
    href: HrefOrHrefWithParams<Pathname>,
    ...args: ParametersExceptFirst<typeof serverRedirect>
  ) {
    const locale = getRequestLocale();
    const pathname = getPathname({href, locale});
    return serverRedirect({localePrefix: finalLocalePrefix, pathname}, ...args);
  }

  function permanentRedirect<Pathname extends keyof PathnamesConfig>(
    href: HrefOrHrefWithParams<Pathname>,
    ...args: ParametersExceptFirst<typeof serverPermanentRedirect>
  ) {
    const locale = getRequestLocale();
    const pathname = getPathname({href, locale});
    return serverPermanentRedirect(
      {localePrefix: finalLocalePrefix, pathname},
      ...args
    );
  }

  function getPathname({
    href,
    locale
  }: {
    locale: Locales[number];
    href: HrefOrHrefWithParams<keyof PathnamesConfig>;
  }) {
    return compileLocalizedPathname({
      ...normalizeNameOrNameWithParams(href),
      locale,
      pathnames: opts.pathnames
    });
  }

  function notSupported(hookName: string) {
    return () => {
      throw new Error(
        `\`${hookName}\` is not supported in Server Components. You can use this hook if you convert the component to a Client Component.`
      );
    };
  }

  return {
    Link,
    redirect,
    permanentRedirect,
    getPathname,
    usePathname: notSupported('usePathname'),
    useRouter: notSupported('useRouter')
  };
}
