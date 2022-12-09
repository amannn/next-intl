import 'server-only';
import {createIntl} from 'use-intl/dist/src/core';
// eslint-disable-next-line import/default -- False positive
import IntlContextValue from 'use-intl/dist/src/react/IntlContextValue';
import NextRequestStorage from './NextRequestStorage';

class NextIntlRequestStorage {
  private key = '__next-intl';

  private storage: NextRequestStorage<
    IntlContextValue & {
      intl: ReturnType<typeof createIntl>;
    }
  >;

  constructor() {
    this.storage = new NextRequestStorage(this.key);
  }

  public initRequest(opts: IntlContextValue) {
    const now = opts.now || new Date();

    // Since `useIntl` doesn't take any params, we can cache it here.
    const intl = createIntl(opts);

    this.storage.set({...opts, intl, now});
  }

  public isInitialized() {
    return this.storage.get() != null;
  }

  public getIntlOpts() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {intl, ...opts} = this.getInitializedStorage();
    return opts;
  }

  public getLocale() {
    return this.getInitializedStorage().locale;
  }

  public getIntl() {
    return this.getInitializedStorage().intl;
  }

  public getNow() {
    return this.getInitializedStorage().now;
  }

  public getTimeZone() {
    return this.getInitializedStorage().timeZone;
  }

  private getInitializedStorage() {
    if (!this.isInitialized()) {
      throw new Error('`NextIntlServerProvider` was not initialized.');
    }

    return this.storage.get()!;
  }
}

// Provide a singleton-instance of the storage.
const instance = new NextIntlRequestStorage();

export default instance;
