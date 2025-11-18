import {useExtracted} from 'next-intl';

function Component() {
  const t = useExtracted();
  t('{date, date, short}!', {date: new Date()}, {short: {dateStyle: 'short'}});
}
