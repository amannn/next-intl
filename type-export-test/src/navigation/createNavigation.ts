import {createNavigation} from 'next-intl/navigation';
import {routing} from '../routing';

export const {
  Link,
  getPathname,
  permanentRedirect,
  redirect,
  usePathname,
  useRouter
} = createNavigation(routing);
