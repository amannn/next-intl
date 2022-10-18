import acceptLanguageParser from 'accept-language-parser';
import type {NextApiRequest, NextApiResponse} from 'next';
import {createIntl, createTranslator} from 'next-intl';
import nextConfig from '../../../next.config';

// This file demonstrates how `next-intl` can
// be used in API routes to translate messages.

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Next.js doesn't provide a way to get the locale from
  // the request, so we have to parse it ourselves.
  const locale = resolveLocale(req);

  // Fetch messages based on the locale.
  const messages = await import(`../../../messages/${locale}.json`);

  // This creates the same function that is returned by `useTranslations`.
  // Since there's no provider, you can pass all the properties you'd
  // usually pass to the provider directly here.
  const t = createTranslator({
    locale,
    messages,
    namespace: 'Index'
  });

  // Creates the same object that is returned by `useIntl`.
  const intl = createIntl({locale});

  res.status(200).json({
    locale,
    key: 'Index.title',
    message: t('title'),
    date: intl.formatDateTime(new Date(), {dateStyle: 'medium'})
  });
}

function resolveLocale(request: NextApiRequest) {
  const {defaultLocale, locales} = nextConfig.i18n;
  const locale =
    acceptLanguageParser.pick(
      locales,
      request.headers['accept-language'] || defaultLocale
    ) || defaultLocale;

  return locale;
}
