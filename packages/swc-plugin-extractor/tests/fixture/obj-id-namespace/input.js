import {useExtracted} from 'next-intl';

function Component() {
  const t = useExtracted('ui');
  t({id: 'greeting', message: 'Hello!'});
}
