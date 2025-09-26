import {useExtracted} from 'next-intl';
import Client from './Client';

export default function Index() {
  const t = useExtracted();
  return (
    <>
      <h1>{t('Hey from server!')}</h1>
      <Client />
    </>
  );
}
