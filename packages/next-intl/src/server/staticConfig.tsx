// @ts-expect-error Should we provide a default? Probably.
import staticConfig from 'next-intl/config';
import NextI18nConfig from './NextI18nConfig';

export default staticConfig as NextI18nConfig;
