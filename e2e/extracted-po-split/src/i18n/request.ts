import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async () => {
  const locale = 'en';
  const root = (await import(`../../messages/${locale}.po`)).default as Record<
    string,
    unknown
  >;
  const ui = (await import(`../../messages/ui/${locale}.po`)).default as Record<
    string,
    unknown
  >;

  return {
    locale,
    messages: {
      ...root,
      ...ui
    }
  };
});
