'use server';

import {revalidatePath} from 'next/cache';
import {setUserLocale} from '@/db';

export default async function updateLocale(data: FormData) {
  const locale = data.get('locale') as string;

  setUserLocale(locale);
  revalidatePath('/app');
}
