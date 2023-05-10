/**
 * Client-only APIs available via `next-intl/client`.
 */

import usePathname from './usePathname';
import useRouter from './useRouter';

export {default as useRouter} from './useRouter';
export {default as usePathname} from './usePathname';

/** @deprecated Is called `usePathname` now. */
export const useUnlocalizedPathname = usePathname;

/** @deprecated Is called `useRouter` now. */
export const useLocalizedRouter = useRouter;

// Legacy export (deprecation is handled by component)
export {default as NextIntlClientProvider} from './NextIntlClientProvider';
