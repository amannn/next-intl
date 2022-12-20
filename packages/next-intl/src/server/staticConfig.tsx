// @ts-expect-error Should we provide a default? Probably.
import staticConfig from 'next-intl/config';
import NextIntlConfig from './NextIntlConfig';

export default staticConfig as NextIntlConfig;
