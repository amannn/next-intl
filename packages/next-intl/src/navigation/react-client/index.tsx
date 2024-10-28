export {default as createSharedPathnamesNavigation} from './createSharedPathnamesNavigation.tsx';
export {default as createLocalizedPathnamesNavigation} from './createLocalizedPathnamesNavigation.tsx';
export {default as createNavigation} from './createNavigation.tsx';

import type {
  Locales,
  Pathnames as PathnamesDeprecatedExport
} from '../../routing/types.tsx';

/** @deprecated Please import from `next-intl/routing` instead. */
export type Pathnames<AppLocales extends Locales> =
  PathnamesDeprecatedExport<AppLocales>;
