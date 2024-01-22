// @ts-check

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.tsx');
export default withNextIntl();
