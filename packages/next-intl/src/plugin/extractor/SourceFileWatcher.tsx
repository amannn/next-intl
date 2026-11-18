import {SourceFileFilter} from '@eloqnt/extractor/_internal';
import {type AsyncSubscription, type Event, subscribe} from '@parcel/watcher';

export default class SourceFileWatcher implements Disposable {
  private subscriptions: Array<AsyncSubscription> = [];
  private roots: Array<string>;
  private onChange: (events: Array<Event>) => Promise<void>;

  public constructor(
    roots: Array<string>,
    onChange: (events: Array<Event>) => Promise<void>
  ) {
    this.roots = roots;
    this.onChange = onChange;
  }

  public async start() {
    if (this.subscriptions.length > 0) {
      return;
    }

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
