import React, {ComponentProps, ReactElement, forwardRef} from 'react';
import {AllLocales, LocalePrefix} from '../../shared/types';
import BaseLink from './BaseLink';
import baseRedirect from './baseRedirect';
import useBasePathname from './useBasePathname';
import useBaseRouter from './useBaseRouter';

export default function createSharedPathnamesNavigation<
  Locales extends AllLocales
>(opts: {locales: Locales; localePrefix?: LocalePrefix}) {
  type LinkProps = Omit<
    ComponentProps<typeof BaseLink<Locales>>,
    'localePrefix'
  >;
  function Link(props: LinkProps, ref: LinkProps['ref']) {
    return (
      <BaseLink<Locales>
        ref={ref}
        localePrefix={opts.localePrefix}
        {...props}
      />
    );
  }
  const LinkWithRef = forwardRef(Link) as (
    props: LinkProps & {ref?: LinkProps['ref']}
  ) => ReactElement;
  (LinkWithRef as any).displayName = 'Link';

  return {
    Link: LinkWithRef,
    redirect: baseRedirect,
    usePathname: useBasePathname,
    useRouter: useBaseRouter
  };
}
