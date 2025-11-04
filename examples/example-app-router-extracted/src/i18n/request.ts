import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

export default getRequestConfig(async (params) => {
  const store = await cookies();
  const locale = params.locale || store.get('locale')?.value || 'en';
  const messages = (await import(`../../messages/${locale}.po`)).default;

  return {
    locale,
    messages
  };
});
