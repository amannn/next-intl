// @ts-expect-error -- React uses CJS
export * from 'react';

export {default} from 'react';

export function use(promise: Promise<unknown> & {value?: unknown}) {
  if (!(promise instanceof Promise)) {
    throw new Error('Expected a promise, got ' + typeof promise);
  }

  if (promise.value) {
    return promise.value;
  } else {
    throw promise.then((value) => {
      promise.value = value;
      return promise;
    });
  }
}

const cached = {} as Record<string, unknown>;

export function cache(fn: (...args: Array<unknown>) => unknown) {
  if (!fn.name) {
    throw new Error('Expected a named function for easier debugging');
  }

  function cachedFn(...args: Array<unknown>) {
    const key = `${fn.name}(${args
      .map((arg) => JSON.stringify(arg))
      .join(', ')})`;

    if (cached[key]) {
      return cached[key];
    } else {
      const result = fn(...args);
      cached[key] = result;
      return result;
    }
  }

  return cachedFn;
}

cache.reset = () => {
  Object.keys(cached).forEach((key) => {
    delete cached[key];
  });
};
