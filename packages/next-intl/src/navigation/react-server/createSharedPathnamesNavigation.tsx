import {AllLocales} from '../../shared/types';
import BaseLink from './BaseLink';
import baseRedirect from './baseRedirect';

export default function createSharedPathnamesNavigation<
  Locales extends AllLocales
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- The value is not used yet, only the type information is important
>(opts: {locales: Locales}) {
  function notSupported(message: string) {
    return () => {
      throw new Error(
        `\`${message}\` is not supported in Server Components. You can use this hook if you convert the component to a Client Component.`
      );
    };
  }

  return {
    Link: BaseLink<Locales>,
    redirect: baseRedirect,
    usePathname: notSupported('usePathname'),
    useRouter: notSupported('useRouter')
  };
}
