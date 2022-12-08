import {createTranslator, createIntl} from 'use-intl/dist/src/core';
// eslint-disable-next-line import/default -- False positive
import IntlContextValue from 'use-intl/dist/src/react/IntlContextValue';
import NextRequestStorage from './NextRequestStorage';

class NextIntlRequestStorage {
  private key = '__next-intl';

  private storage: NextRequestStorage<
    IntlContextValue & {
      translator: ReturnType<typeof createTranslator>;
      intl: ReturnType<typeof createIntl>;
    }
  >;

  constructor() {
    this.storage = new NextRequestStorage(this.key);
  }

  public initRequest(opts: IntlContextValue) {
    const translator = createTranslator({
      ...opts,
      messages: opts.messages
    });
    const intl = createIntl(opts);
    const now = opts.now || new Date();

    this.storage.set({...opts, translator, intl, now});
  }

  public isInitialized() {
    return this.storage.get() != null;
  }

  public getLocale() {
    return this.getInitializedStorage().locale;
  }

  public getTranslator() {
    return this.getInitializedStorage().translator;
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
