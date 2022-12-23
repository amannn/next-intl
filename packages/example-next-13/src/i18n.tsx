import {NextIntlConfig} from 'next-intl';

const i18n: NextIntlConfig = {
  locales: ['en', 'de'],
  defaultLocale: 'en',
  async getMessages({locale}) {
    return (await import(`../messages/${locale}.json`)).default;
  }
};

export default i18n;
