import {NextRequest, NextResponse} from 'next/server';
import {getTranslator} from 'next-intl/server';

type Props = {
  params: {
    locale: string;
  };
};

export async function GET(request: NextRequest, {params: {locale}}: Props) {
  const name = request.nextUrl.searchParams.get('name');
  if (!name) {
    return new Response('Search param `name` was not provided.', {status: 400});
  }

  const t = await getTranslator({locale, namespace: 'ApiRoute'});
  return NextResponse.json({message: t('hello', {name})});
}
