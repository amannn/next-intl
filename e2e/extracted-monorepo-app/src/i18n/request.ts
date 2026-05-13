import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = store.get('locale')?.value || 'en';

  const sharedUiMessages = (await import(`e2e-shared-ui/messages/${locale}.po`))
    .default;
  const appMessages = (await import(`../../messages/${locale}.po`)).default;
  const messages = {
    ...sharedUiMessages,
    ...appMessages
  };

  return {
    locale,
    messages
  };
});
