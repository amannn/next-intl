import SourceFileWatcher, {
  type SourceFileWatcherEvent
} from '../extractor/source/SourceFileWatcher.js';

type Subscriber = (
  events: Array<SourceFileWatcherEvent>
) => Promise<void> | void;

let configuredRoots: Array<string> | undefined;
let watcher: SourceFileWatcher | undefined;
const subscribers = new Set<Subscriber>();

export function configureSharedSourceWatcher(roots: Array<string>) {
  configuredRoots = roots;
}

async function dispatch(events: Array<SourceFileWatcherEvent>) {
  await Promise.all(
    Array.from(subscribers).map(async (callback) => callback(events))
  );
}

async function ensureWatcher() {
  if (watcher) return watcher;
  if (!configuredRoots || configuredRoots.length === 0) {
    throw new Error(
      '[next-intl] configureSharedSourceWatcher must be called before subscribing.'
    );
  }
  watcher = new SourceFileWatcher(configuredRoots, dispatch);
  await watcher.start();
  return watcher;
}

export async function subscribeSharedSourceWatcher(subscriber: Subscriber) {
  const activeWatcher = await ensureWatcher();
  subscribers.add(subscriber);

  async function unsubscribe() {
    subscribers.delete(subscriber);
    if (subscribers.size === 0 && watcher) {
      await watcher.stop();
      watcher = undefined;
    }
  }

  return {watcher: activeWatcher, unsubscribe};
}

export function getSharedSourceWatcherInstance() {
  return watcher;
}
