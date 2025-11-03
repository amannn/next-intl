type CacheItem<Value> = {
  key: string;
  value: Value;
};

export default class LRUCache<Value> {
  private readonly maxSize: number;
  private cache: Map<string, CacheItem<Value>>;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
    this.cache = new Map<string, CacheItem<Value>>();
  }

  set(key: string, value: Value): void {
    if (this.cache.size >= this.maxSize) {
      const lruKey = this.cache.keys().next().value;
      if (lruKey !== undefined) {
        this.cache.delete(lruKey);
      }
    }
    this.cache.set(key, {key, value});
  }

  get(key: string): Value | undefined {
    const item = this.cache.get(key);
    if (item) {
      this.cache.delete(key);
      this.cache.set(key, item);
      return item.value;
    }
    return undefined;
  }
}
