import {createNavigation} from 'next-intl/navigation';
import {routing} from './routing';

export const {Link} = createNavigation(routing);
