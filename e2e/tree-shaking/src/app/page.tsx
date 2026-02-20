import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider, useExtracted} from 'next-intl';
import Counter from './Counter';

export default function Index() {
  const t = useExtracted();
  const user = {name: 'Jane'};

  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <div>
        <h1>{t('Hey {name}!', user)}</h1>
        <Counter />
      </div>
    </NextIntlClientProvider>
  );
}
