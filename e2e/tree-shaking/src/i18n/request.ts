import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async () => {
  const locale = 'en';

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
