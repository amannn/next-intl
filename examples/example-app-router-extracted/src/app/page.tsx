import {useExtracted} from 'next-intl';
import Client from './Client';

export default function Index() {
  const t = useExtracted();
  return (
    <>
      <h1>{t('Hey there!')}</h1>
      <h1>{t('This is a test from the page.')}</h1>
      <Client />
    </>
  );
}
