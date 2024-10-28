import {useNow} from 'next-intl';
// @ts-ignore -- Not available in current types
import {use} from 'react';

export default function DelayedServerContent() {
  use(new Promise((resolve) => setTimeout(resolve, 50)));
  const now = useNow();

  return (
    <>
      <p data-testid="NowFromServerDelayed">{now.toISOString()}</p>
    </>
  );
}
