import {NextConfig} from 'next';

const config = {
  i18n: {
    locales: ['en', 'de'],
    defaultLocale: 'en'
  }
} satisfies NextConfig;

export default config;
