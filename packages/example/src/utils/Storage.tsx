import {requestAsyncStorage} from 'next/dist/client/components/request-async-storage';

const key = '__next-intl';

/**
 * Returns the request-level storage of Nex.js where typically headers
 * and cookies are stored. This is recreated for every request.
 */
function getStorage() {
  const requestStore =
    requestAsyncStorage && 'getStore' in requestAsyncStorage
      ? requestAsyncStorage.getStore()!
      : requestAsyncStorage;

  return requestStore;
}

export default {
  set(value: any) {
    const storage = getStorage();
    (storage as any)[key] = value;
  },
  get() {
    const storage = getStorage();
    return (storage as any)[key];
  }
};
