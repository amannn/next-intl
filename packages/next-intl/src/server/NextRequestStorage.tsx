import {requestAsyncStorage} from 'next/dist/client/components/request-async-storage';

/**
 * Returns the request-level storage of Next.js where typically headers
 * and cookies are stored. This is recreated for every request.
 *
 * This uses internal APIs of Next.js and may break in
 * the future, so we should really move away from this.
 */
export default class NextRequestStorage<Data> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  public set(value: Data) {
    const storage = this.getStorage();
    (storage as any)[this.key] = value;
  }

  public get(): Data | undefined {
    const storage = this.getStorage();
    return (storage as any)[this.key];
  }

  private getStorage() {
    const requestStore =
      requestAsyncStorage && 'getStore' in requestAsyncStorage
        ? requestAsyncStorage.getStore()
        : requestAsyncStorage;

    return requestStore;
  }
}
