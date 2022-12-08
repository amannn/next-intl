import {createTranslator} from 'use-intl/dist/src/core';
import NextRequestStorage from './NextRequestStorage';

class NextIntlRequestStorage {
  private key = '__next-intl';

  private storage: NextRequestStorage<{
    translator: any; // TODO: Use a better type
    locale: string;
  }>;

  constructor() {
    this.storage = new NextRequestStorage(this.key);
  }

  public initRequest(...args: Parameters<typeof createTranslator>) {
    const translator = createTranslator(...args);
    this.storage.set({translator, locale: args[0].locale});
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

  private getInitializedStorage() {
    if (!this.isInitialized()) {
      throw new Error('Locale not set');
    }

    return this.storage.get()!;
  }
}

// Provide a singleton-instance of the storage.
const instance = new NextIntlRequestStorage();

export default instance;
