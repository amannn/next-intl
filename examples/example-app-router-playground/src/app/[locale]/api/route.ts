import {NextRequest, NextResponse} from 'next/server';
import {getTranslations} from 'next-intl/server';

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name');
  if (!name) {
    return new Response('Search param `name` was not provided.', {status: 400});
  }

  const t = await getTranslations('ApiRoute');
  return NextResponse.json({message: t('hello', {name})});
}
