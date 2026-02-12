import {useExtracted} from 'next-intl';
import {UsedBarrelComponent} from './components';

export default function BarrelPage() {
  const t = useExtracted();

  return (
    <div>
      <p>{t('Barrel page')}</p>
      <UsedBarrelComponent />
    </div>
  );
}
