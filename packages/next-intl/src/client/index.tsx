/**
 * Client-only APIs.
 */

import NextIntlClientProvider_ from '../shared/NextIntlClientProvider';
import usePathname from './usePathname';
import useRouter from './useRouter';

export {default as useRouter} from './useRouter';
export {default as usePathname} from './usePathname';

/** @deprecated Is called `usePathname` now. */
export const useUnlocalizedPathname = usePathname;

/** @deprecated Is called `useRouter` now. */
export const useLocalizedRouter = useRouter;

/** @deprecated Should be imported from `next-intl`, not `next-intl/client`. */
export const NextIntlClientProvider = NextIntlClientProvider_;
