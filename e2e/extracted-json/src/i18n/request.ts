import {cookies} from 'next/headers';
import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async () => {
  const locale = (await cookies()).get('locale')?.value === 'de' ? 'de' : 'en';
  const messages = (await import(`../../messages/${locale}.json`))
    .default as Record<string, unknown>;

  return {locale, messages};
});
