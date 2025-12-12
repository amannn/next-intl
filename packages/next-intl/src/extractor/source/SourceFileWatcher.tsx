import {type AsyncSubscription, type Event, subscribe} from '@parcel/watcher';
import SourceFileFilter from './SourceFileFilter.js';

type OnChange = (events: Array<Event>) => Promise<void>;

export default class SourceFileWatcher implements Disposable {
  private subscriptions: Array<AsyncSubscription> = [];
  private roots: Array<string>;
  private onChange: OnChange;

  constructor(roots: Array<string>, onChange: OnChange) {
    this.roots = roots;
    this.onChange = onChange;
  }

  async start() {
    if (this.subscriptions.length > 0) return;

    const ignore = SourceFileFilter.IGNORED_DIRECTORIES.map(
      (dir) => `**/${dir}/**`
    );

    for (const root of this.roots) {
      const sub = await subscribe(
        root,
        (err, events) => {
          if (err) {
            console.error(err);
            return;
          }
          const filteredEvents = events.filter((event) =>
            SourceFileFilter.isSourceFile(event.path)
          );
          if (filteredEvents.length > 0) {
            void this.onChange(filteredEvents);
          }
        },
        {ignore}
      );
      this.subscriptions.push(sub);
    }
  }

  async stop() {
    await Promise.all(this.subscriptions.map((sub) => sub.unsubscribe()));
    this.subscriptions = [];
  }

  [Symbol.dispose](): void {
    void this.stop();
  }
}
