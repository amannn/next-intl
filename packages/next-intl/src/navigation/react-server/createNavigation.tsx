import {
  permanentRedirect as nextPermanentRedirect,
  redirect as nextRedirect
} from 'next/navigation';
import React, {ComponentProps} from 'react';
import {
  receiveRoutingConfig,
  ResolvedRoutingConfig,
  RoutingConfigLocalizedNavigation,
  RoutingConfigSharedNavigation
} from '../../routing/config';
import {Locales, Pathnames} from '../../routing/types';
import {getRequestLocale} from '../../server/react-server/RequestLocale';
import {ParametersExceptFirst} from '../../shared/types';
import {
  HrefOrHrefWithParams,
  HrefOrUrlObjectWithParams,
  applyPathnamePrefix,
  compileLocalizedPathname,
  normalizeNameOrNameWithParams
} from '../shared/utils';
import ServerLink from './ServerLink';

export default function createNavigation<
  const AppLocales extends Locales,
  const AppPathnames extends Pathnames<AppLocales> = never
>(
  routing?: [AppPathnames] extends [never]
    ? RoutingConfigSharedNavigation<AppLocales> | undefined
    : RoutingConfigLocalizedNavigation<AppLocales, AppPathnames>
) {
  type Locale = AppLocales extends never ? string : AppLocales[number];

  // Slightly different than e.g. `redirect` which only allows to pass `query`
  // type LinkHref

  const config = receiveRoutingConfig(
    routing || {}
  ) as typeof routing extends undefined
    ? Pick<ResolvedRoutingConfig<AppLocales>, 'localePrefix'>
    : [AppPathnames] extends [never]
      ? ResolvedRoutingConfig<AppLocales>
      : ResolvedRoutingConfig<AppLocales, AppPathnames>;

  const pathnames = (config as any).pathnames as [AppPathnames] extends [never]
    ? undefined
    : AppPathnames;

  function getCurrentLocale() {
    return getRequestLocale() as Locale;
  }

  type LinkProps<Pathname extends keyof AppPathnames = never> = Omit<
    ComponentProps<typeof ServerLink>,
    'href' | 'localePrefix'
  > & {
    href: [AppPathnames] extends [never]
      ? ComponentProps<typeof ServerLink>['href']
      : HrefOrUrlObjectWithParams<Pathname>;
    locale?: Locale;
  };
  function Link<Pathname extends keyof AppPathnames = never>({
    href,
    locale,
    ...rest
  }: LinkProps<Pathname>) {
    const curLocale = getCurrentLocale();
    const finalLocale = locale || curLocale;

    return (
      <ServerLink
        href={
          pathnames != null
            ? compileLocalizedPathname<AppLocales, Pathname>({
                locale: finalLocale,
                // @ts-expect-error -- This is ok
                pathname: href,
                // @ts-expect-error -- This is ok
                params: typeof href === 'object' ? href.params : undefined,
                pathnames
              })
            : (href as string)
        }
        locale={locale}
        localePrefix={config.localePrefix}
        {...rest}
      />
    );
  }

  // TODO: Should this be called in Link? Maybe not, we can hydrate for one case there. Or: Call it with localePrefix: 'always' and again on the client side?
  // New: Locale is now optional (do we want this?)
  // New: accepts plain href argument
  // New: getPathname is available for shared pathnames
  function getPathname(
    href: [AppPathnames] extends [never]
      ? string | {locale: Locale; href: string}
      :
          | HrefOrHrefWithParams<keyof AppPathnames>
          | {
              locale: Locale;
              href: HrefOrHrefWithParams<keyof AppPathnames>;
            },
    /** @private */
    forcePrefix?: boolean
  ) {
    let hrefArg: [AppPathnames] extends [never]
      ? string
      : HrefOrHrefWithParams<keyof AppPathnames>;
    let locale;
    if (typeof href === 'object' && 'locale' in href) {
      locale = href.locale;
      // @ts-expect-error -- This is implied
      hrefArg = href.href;
    } else {
      hrefArg = href as typeof hrefArg;
    }

    if (!locale) locale = getCurrentLocale();

    let pathname: string;
    if (pathnames == null) {
      // @ts-expect-error -- This is ok
      pathname = typeof href === 'string' ? href : href.href;
    } else {
      pathname = compileLocalizedPathname({
        locale,
        // @ts-expect-error -- This is ok
        ...normalizeNameOrNameWithParams(hrefArg),
        // @ts-expect-error -- This is ok
        pathnames: config.pathnames
      });
    }

    // TODO: There might be only one shot here, for as-necessary
    // and domains, should we apply the prefix here? Alternative
    // would be reading `host`, but that breaks SSG. If you want
    // to get the first shot right, pass a `domain` here (then
    // the user opts into dynamic rendering)
    return applyPathnamePrefix({
      pathname,
      locale,
      routing: config,
      force: forcePrefix
    });
  }

  function baseRedirect(
    fn: typeof nextRedirect | typeof nextPermanentRedirect,
    href: Parameters<typeof getPathname>[0],
    ...args: ParametersExceptFirst<typeof nextRedirect>
  ) {
    const isChangingLocale = typeof href === 'object' && 'locale' in href;
    return fn(getPathname(href, isChangingLocale), ...args);
  }

  function redirect(
    href: Parameters<typeof getPathname>[0],
    ...args: ParametersExceptFirst<typeof nextRedirect>
  ) {
    return baseRedirect(nextRedirect, href, ...args);
  }

  function permanentRedirect(
    href: Parameters<typeof getPathname>[0],
    ...args: ParametersExceptFirst<typeof nextPermanentRedirect>
  ) {
    return baseRedirect(nextPermanentRedirect, href, ...args);
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
