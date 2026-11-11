import {useExtracted} from 'next-intl';

function Component() {
  const t = useExtracted();
  const values = {date: new Date()};
  const formats = {date: {dateStyle: 'short'}};
  t({message: 'Today is {date, date, short}', values, formats});
}
