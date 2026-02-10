'use server';

import ActionComponent from './ActionComponent';
import {getExtracted} from 'next-intl/server';

export async function loadContent() {
  const t = await getExtracted();
  return (
    <div>
      <p>{t('Lazy server content')}</p>
      <ActionComponent />
    </div>
  );
}
