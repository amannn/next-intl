import {GetNextIntlRuntimeConfig} from 'next-intl';

export default {
  locales: ['en', 'de'],
  defaultLocale: 'en'
};

export const getRuntimeConfig: GetNextIntlRuntimeConfig = async ({locale}) => ({
  messages: (await import(`../messages/${locale}.json`)).default
});
