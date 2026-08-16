import {useExtracted} from 'next-intl';
import Greeting from '@/components/Greeting';

export default function Page() {
  const t = useExtracted();
  return (
    <div>
      <h1>{t('Hello')}</h1>
      <Greeting />
    </div>
  );
}
