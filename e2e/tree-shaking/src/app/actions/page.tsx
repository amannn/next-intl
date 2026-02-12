import {useExtracted} from 'next-intl';
import ServerActionForm from './ServerActionForm';

export default function ActionsPage() {
  const t = useExtracted();
  return (
    <div>
      <p>{t('Server action page')}</p>
      <ServerActionForm />
    </div>
  );
}
