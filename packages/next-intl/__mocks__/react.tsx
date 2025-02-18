import {isPromise} from '../src/shared/utils';

// @ts-expect-error -- React uses CJS
export * from 'react';

export {default} from 'react';

export function use(promise: Promise<unknown> & {value?: unknown}) {
  if (!isPromise(promise)) {
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

let cached = new WeakMap();

export function cache(fn: (...args: Array<unknown>) => unknown) {
  if (!fn.name) {
    throw new Error('Expected a named function for easier debugging');
  }

  function cachedFn(...args: Array<unknown>) {
    let cacheForThisFn = cached.get(fn);
    if (!cacheForThisFn) {
      cacheForThisFn = new Map();
      cached.set(fn, cacheForThisFn);
    }

    const key = JSON.stringify(args);
    if (cacheForThisFn.has(key)) {
      return cacheForThisFn.get(key);
    } else {
      const result = fn(...args);
      cacheForThisFn.set(key, result);
      return result;
    }
  }

  return cachedFn;
}

cache.reset = () => {
  cached = new WeakMap();
};
