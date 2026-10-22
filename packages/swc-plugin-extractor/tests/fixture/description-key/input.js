import {useExtracted} from 'next-intl';

function Component() {
  const t = useExtracted();
  t('Open');
  t({message: 'Open', description: 'Button that opens the file'});
  t({message: 'Open', description: 'Status of an invoice'});
  t({message: 'Open', description: ''});
  t({id: 'openLink', message: 'Open', description: 'Link to the file'});
}
