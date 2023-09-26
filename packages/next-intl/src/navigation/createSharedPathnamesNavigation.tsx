import usePathname from '../client/usePathname';
import useRouter from '../client/useRouter';
import {AllLocales} from '../shared/types';
import Link from './Link';
import redirect from './redirect';

export default function createSharedPathnamesNavigation<
  Locales extends AllLocales
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- The value is not used yet, only the type information is important
>(opts: {locales: Locales}) {
  return {
    Link: Link as typeof Link<Locales>,
    redirect,
    usePathname,
    useRouter
  };
}
