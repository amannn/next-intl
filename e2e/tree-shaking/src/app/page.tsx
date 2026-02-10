import {useExtracted} from 'next-intl';
import Counter from './Counter';

export default function Index() {
  const t = useExtracted();
  const user = {name: 'Jane'};

  return (
    <div>
      <h1>{t('Hey {name}!', user)}</h1>
      <Counter />
    </div>
  );
}
