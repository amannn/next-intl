import {useState, useEffect} from 'react';
import useIntlContext from './useIntlContext';

type Options = {
  updateInterval?: number;
};

function getNow() {
  return new Date();
}

/**
 * Reading the current date via `new Date()` in components should be avoided, as
 * it causes components to be impure and can lead to flaky tests. Instead, this
 * hook can be used.
 *
 * By default, it returns the time when the component mounts. If `updateInterval`
 * is specified, the value will be updated based on the interval.
 *
 * You can however also return a static value from this hook, if you
 * configure the `now` parameter on the context provider. Note however,
 * that if `updateInterval` is configured in this case, the component
 * will initialize with the global value, but will afterwards update
 * continuously based on the interval.
 *
 * For unit tests, this can be mocked to a constant value. For end-to-end
 * testing, an environment parameter can be passed to the `now` parameter
 * of the provider to mock this to a static value.
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

  return now;
}
