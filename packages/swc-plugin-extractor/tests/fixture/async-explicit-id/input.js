import {getExtracted} from 'next-intl/server';

async function Component() {
  const t = await getExtracted();
  t({
    id: 'greeting',
    message: 'Hello {name}!',
    values: {name: 'Alice'}
  });
}
