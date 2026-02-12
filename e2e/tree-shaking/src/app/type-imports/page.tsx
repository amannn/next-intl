import TypeImportComponent from './TypeImportComponent';
import {useExtracted} from 'next-intl';

export type Test = 'test';

export default function TypeImportsPage() {
  const t = useExtracted();
  return (
    <div>
      <p>{t('Type imports page')}</p>
      <TypeImportComponent />
    </div>
  );
}
