import {useExtracted} from 'next-intl';

function Component() {
  const t = useExtracted();
  t.rich('Hello <b>Alice</b>!', {b: (chunks) => <b>{chunks}</b>});
}
