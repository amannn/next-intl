import {NextRequest, NextResponse} from 'next/server';
import {Locale} from 'next-intl';
import {getTranslations} from 'next-intl/server';

type Props = {
  params: {
    locale: Locale;
  };
};

export async function GET(request: NextRequest, {params: {locale}}: Props) {
  const name = request.nextUrl.searchParams.get('name');
  if (!name) {
    return new Response('Search param `name` was not provided.', {status: 400});
  }

  const t = await getTranslations({locale, namespace: 'ApiRoute'});
  return NextResponse.json({message: t('hello', {name})});
}
