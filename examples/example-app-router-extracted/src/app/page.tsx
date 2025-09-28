import {useExtracted} from 'next-intl';
import Client from './Client';

export default function Index() {
  const t = useExtracted();
  const name = 'Jane';
  return (
    <>
      <h1>{t('Hey {name}!', {name})}</h1>
      <p>{t('This is a test from the page.')}</p>
      <Client />
    </>
  );
}
