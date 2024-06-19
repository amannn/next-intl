'use server';

import {revalidatePath} from 'next/cache';
import {setUserLocale} from '@/db';

export default async function updateLocale(data: FormData) {
  const locale = data.get('locale') as string;

  setUserLocale(locale);

  // Note: We need to call `router.refresh()` additionally on
  // the client side for the client receive updated markup
  revalidatePath('/app');
}
