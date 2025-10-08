import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

export default getRequestConfig(async (opts) => {
  const store = await cookies();
  const locale = opts.locale || store.get('locale')?.value || 'en';
  const messages = (await import(`../../messages/${locale}.json`)).default;
  return {
    locale,
    messages
  };
});
