import {useExtracted} from 'next-intl';

function Component() {
  const t = useExtracted();
  t({id: "greeting", message: 'Hello!', values: {name: 'Alice'}});
}
