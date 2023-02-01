import {useIntl, useNow, useTimeZone} from 'next-intl';

export default function CurrentTime() {
  const intl = useIntl();
  const now = useNow();
  const timeZone = useTimeZone();

  return (
    <p data-testid="CurrentTime">
      {intl.formatDateTime(now, 'medium')} ({timeZone || 'N/A'})
    </p>
  );
}
