import usePathname from '../client/usePathname';
import useRouter from '../client/useRouter';
import {AllLocales} from '../shared/types';
import BaseLink from './BaseLink';
import baseRedirect from './baseRedirect';

export default function createSharedPathnamesNavigation<
  Locales extends AllLocales
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- The value is not used yet, only the type information is important
>(opts: {locales: Locales}) {
  return {
    Link: BaseLink as typeof BaseLink<Locales>,
    redirect: baseRedirect,
    usePathname,
    useRouter
  };
}
