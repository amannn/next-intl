import {useExtracted} from 'next-intl';

import {GreetingCard} from './greeting-card';
import {LocaleSwitcherCard} from './locale-switcher-card';

export default function HomePage() {
  const t = useExtracted('home');

  return (
    <main style={{display: 'flex', flexDirection: 'column', gap: 24}}>
      <h1>{t('Web app — shared UI demo')}</h1>

      <section
        style={{
          background: '#f5f7ff',
          border: '1px solid #d9deef',
          borderRadius: 12,
          padding: 20
        }}>
        <GreetingCard name="Hugo" unreadCount={3} />
      </section>

      <LocaleSwitcherCard />
    </main>
  );
}
