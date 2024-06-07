'use server';

import {setUserLocale} from '@/db';
import {revalidatePath} from 'next/cache';

export default async function updateLocale(data: FormData) {
  const locale = data.get('locale') as string;

  setUserLocale(locale);
  revalidatePath('/app');
}
