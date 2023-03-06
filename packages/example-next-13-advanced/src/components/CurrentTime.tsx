import {useFormatter, useNow, useTimeZone} from 'next-intl';

export default function CurrentTime() {
  const format = useFormatter();
  const now = useNow();
  const timeZone = useTimeZone();

  return (
    <p data-testid="CurrentTime">
      {format.dateTime(now, 'medium')} ({timeZone || 'N/A'})
    </p>
  );
}
