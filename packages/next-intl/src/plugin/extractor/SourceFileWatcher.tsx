import {SourceFileFilter} from '@eloqnt/extractor/_internal';
import type * as ParcelWatcher from '@parcel/watcher';
import type {AsyncSubscription, Event} from '@parcel/watcher';

export default class SourceFileWatcher implements Disposable {
  private subscriptions: Array<AsyncSubscription> = [];
  private roots: Array<string>;
  private onChange: (events: Array<Event>) => Promise<void>;
  private watcherModule?: Promise<typeof ParcelWatcher>;

  public constructor(
    roots: Array<string>,
    onChange: (events: Array<Event>) => Promise<void>
  ) {
    this.roots = roots;
    this.onChange = onChange;
  }

  // The native binding is loaded on demand, so `next build` and `next start`
  // never pay for it
  private load() {
    return (this.watcherModule ??= import('@parcel/watcher'));
  }

  public async start() {
    if (this.subscriptions.length > 0) {
      return;
    }

    const {subscribe} = await this.load();

    const ignore = SourceFileFilter.IGNORED_DIRECTORIES.map(
      (dir) => `**/${dir}/**`
    );

    for (const root of this.roots) {
      const sub = await subscribe(
        root,
        async (err, events) => {
          if (err) {
            console.error(err);
            return;
          }
          await this.onChange(events);
        },
        {ignore}
      );
      this.subscriptions.push(sub);
    }
  }

  public async stop() {
    await Promise.all(this.subscriptions.map((sub) => sub.unsubscribe()));
    this.subscriptions = [];
  }

  public [Symbol.dispose](): void {
    void this.stop();
  }
}
