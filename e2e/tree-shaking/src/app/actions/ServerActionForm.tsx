'use client';

import {useExtracted} from 'next-intl';
import {loadContent} from './actions';
import {ReactNode, useState} from 'react';

export default function ServerActionForm() {
  const [lazyContent, setLazyContent] = useState<ReactNode>(null);
  const t = useExtracted();

  async function loadLazyContent() {
    const content = await loadContent();
    setLazyContent(content);
  }

  return (
    lazyContent || (
      <button onClick={loadLazyContent}>{t('Load lazy content')}</button>
    )
  );
}
