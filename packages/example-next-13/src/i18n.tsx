import {NextIntlConfig} from 'next-intl';

const config: NextIntlConfig = {
  locales: ['en', 'de'],
  defaultLocale: 'en',
  async getMessages({locale}) {
    return (await import(`../messages/${locale}.json`)).default;
  }
};

export default config;
