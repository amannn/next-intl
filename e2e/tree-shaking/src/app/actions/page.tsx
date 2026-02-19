import DebugMessages from '@/components/DebugMessages';
import {NextIntlClientProvider, useExtracted} from 'next-intl';
import ServerActionForm from './ServerActionForm';

export default function ActionsPage() {
  const t = useExtracted();
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <div>
        <p>{t('Server action page')}</p>
        <ServerActionForm />
      </div>
    </NextIntlClientProvider>
  );
}
