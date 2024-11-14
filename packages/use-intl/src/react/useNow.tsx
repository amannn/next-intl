import {useEffect, useState} from 'react';
import useIntlContext from './useIntlContext.tsx';

type Options = {
  updateInterval?: number;
};

function getNow() {
  return new Date();
}

/**
 * @see https://next-intl-docs.vercel.app/docs/usage/dates-times#relative-times-usenow
 */
export default function useNow(options?: Options) {
  const updateInterval = options?.updateInterval;

  const {now: globalNow} = useIntlContext();
  const [now, setNow] = useState(globalNow || getNow());

  useEffect(() => {
    if (!updateInterval) return;

    const intervalId = setInterval(() => {
      setNow(getNow());
    }, updateInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [globalNow, updateInterval]);

  return updateInterval == null && globalNow ? globalNow : now;
}
