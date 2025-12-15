import {type AsyncSubscription, type Event, subscribe} from '@parcel/watcher';
import type Logger from '../utils/Logger.js';
import SourceFileFilter from './SourceFileFilter.js';

type OnChange = (events: Array<Event>) => Promise<void>;

export default class SourceFileWatcher implements Disposable {
  private subscriptions: Array<AsyncSubscription> = [];
  private roots: Array<string>;
  private onChange: OnChange;
  private logger?: Logger;

  public constructor(
    roots: Array<string>,
    onChange: OnChange,
    logger?: Logger
  ) {
    this.roots = roots;
    this.onChange = onChange;
    this.logger = logger;
  }

  public async start() {
    if (this.subscriptions.length > 0) {
      void this.logger?.warn('SourceFileWatcher.start() - already started');
      return;
    }

    void this.logger?.info('SourceFileWatcher.start() called', {
      roots: this.roots
    });

    const ignore = SourceFileFilter.IGNORED_DIRECTORIES.map(
      (dir) => `**/${dir}/**`
    );

    for (const root of this.roots) {
      void this.logger?.info(
        'SourceFileWatcher.start() - subscribing to root',
        {
          root
        }
      );
      const sub = await subscribe(
        root,
        (err, events) => {
          if (err) {
            void this.logger?.error('SourceFileWatcher - watch error', {
              root,
              error: String(err)
            });
            console.error(err);
            return;
          }
          void this.logger?.debug('SourceFileWatcher - events received', {
            root,
            eventCount: events.length,
            events: events.map((e) => ({type: e.type, path: e.path}))
          });
          const filteredEvents = events.filter((event) =>
            SourceFileFilter.isSourceFile(event.path)
          );
          if (filteredEvents.length > 0) {
            void this.logger?.info('SourceFileWatcher - filtered events', {
              root,
              filteredCount: filteredEvents.length,
              events: filteredEvents.map((e) => ({type: e.type, path: e.path}))
            });
            void this.onChange(filteredEvents);
          }
        },
        {ignore}
      );
      this.subscriptions.push(sub);
    }
    void this.logger?.info('SourceFileWatcher.start() completed', {
      subscriptionCount: this.subscriptions.length
    });
  }

  public async stop() {
    void this.logger?.info('SourceFileWatcher.stop() called', {
      subscriptionCount: this.subscriptions.length
    });
    await Promise.all(this.subscriptions.map((sub) => sub.unsubscribe()));
    this.subscriptions = [];
    void this.logger?.info('SourceFileWatcher.stop() completed');
  }

  public [Symbol.dispose](): void {
    void this.logger?.info('SourceFileWatcher.dispose() called');
    void this.stop();
  }
}
