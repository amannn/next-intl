import {useExtracted} from 'next-intl';

function Component() {
  const t = useExtracted();
  t.rich({
    id: 'greeting',
    message: 'Hello <b>Alice</b>!',
    values: {b: (chunks) => <b>{chunks}</b>}
  });
}
