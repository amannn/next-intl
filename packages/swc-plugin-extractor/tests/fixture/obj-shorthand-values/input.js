import {useExtracted} from 'next-intl';

function Component() {
  const t = useExtracted();
  const values = {name: 'Alice'};
  t({message: 'Hello {name}!', values});
}
