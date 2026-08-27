import {useExtracted} from 'next-intl';

function Component() {
  const t = useExtracted();
  t('Héllo wörld 🌍');
  t({message: 'Prüfung', description: 'Ünïcode chäracters before the message'});
}
