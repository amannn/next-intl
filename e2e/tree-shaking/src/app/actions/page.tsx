import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider, useExtracted} from 'next-intl';
import ServerActionForm from './ServerActionForm';

export default function ActionsPage() {
  const t = useExtracted();
  return (
    <div>
      <p>{t('Server action page')}</p>
      <NextIntlClientProvider messages="infer">
        <DebugMessages />
        <ServerActionForm />
      </NextIntlClientProvider>
    </div>
  );
}
