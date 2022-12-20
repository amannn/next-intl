// @ts-expect-error Should we provide a default? Probably.
// eslint-disable-next-line import/no-extraneous-dependencies
import staticConfig from 'next-intl/config';
import NextIntlConfig from './NextIntlConfig';

export default staticConfig as NextIntlConfig;
