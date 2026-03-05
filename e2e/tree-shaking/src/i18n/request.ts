import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

export default getRequestConfig(async () => {
  const jar = await cookies();
  const locale = jar.get('locale')?.value || 'en';

  const extractedMessages = (await import(`../../messages/${locale}.po`))
    .default as Record<string, unknown>;
  const manualMessages = (await import(`../../messages/manual/${locale}.json`))
    .default as Record<string, unknown>;
  const messages = {
    ...extractedMessages,
    ...manualMessages
  };

  return {
    locale,
    messages
  };
});
