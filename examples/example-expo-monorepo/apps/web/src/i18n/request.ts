import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = store.get('locale')?.value === 'de' ? 'de' : 'en';

  // Single shared catalog at the workspace root. Strings from this app, the
  // sibling Expo app, and the shared `packages/ui` all live in one .po file.
  const messages = (await import(`../../../../messages/${locale}.po`)).default;
  return {locale, messages};
});
