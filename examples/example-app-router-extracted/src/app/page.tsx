import {useExtracted} from 'next-intl';
import Client from './Client';

export default function Index() {
  const t = useExtracted();
  return (
    <>
      <h1>{t('Hey {name}!', {name: 'Jane'})}</h1>
      <p>{t('This is a test from the page.')}</p>
      <Client />
    </>
  );
}
