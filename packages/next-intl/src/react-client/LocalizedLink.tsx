import {useLocale} from 'use-intl';
import createLocalizedLinkComponent from '../shared/createLocalizedLinkComponent';

const LocalizedLink = createLocalizedLinkComponent(useLocale);

export default LocalizedLink;
