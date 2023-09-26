import {AllLocales} from '../../shared/types';
import Link from './Link';
import redirect from './redirect';

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
    Link: Link<Locales>,
    redirect,
    usePathname: notSupported('usePathname'),
    useRouter: notSupported('useRouter')
  };
}
