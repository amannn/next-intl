// @ts-check

import NextIntlPlugin from 'next-intl/plugin';

const withNextIntl = NextIntlPlugin('./src/i18n.tsx');
export default withNextIntl();
