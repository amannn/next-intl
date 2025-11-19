import {useExtracted} from 'next-intl';

function Component() {
  const t = useExtracted();
  t.has('Hello there!');
}
