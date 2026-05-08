import {useExtracted} from 'next-intl';
import Greeting from '@/components/Greeting';
import Footer from '@/components/Footer';

export default function Page() {
  const t = useExtracted();
  return (
    <div>
      <h1>{t('Hello')}</h1>
      <Greeting />
      <Footer />
    </div>
  );
}
