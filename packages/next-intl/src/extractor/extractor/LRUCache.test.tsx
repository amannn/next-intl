import {expect, it} from 'vitest';
import LRUCache from './LRUCache.js';

it('should store and retrieve values', () => {
  const cache = new LRUCache<string>(3);

  cache.set('key1', 'value1');
  cache.set('key2', 'value2');

  expect(cache.get('key1')).toBe('value1');
  expect(cache.get('key2')).toBe('value2');
  expect(cache.get('key3')).toBeUndefined();
});

it('should evict least recently used items when capacity is exceeded', () => {
  const cache = new LRUCache<string>(2);

  cache.set('key1', 'value1');
  cache.set('key2', 'value2');
  cache.set('key3', 'value3');

  expect(cache.get('key1')).toBeUndefined();
  expect(cache.get('key2')).toBe('value2');
  expect(cache.get('key3')).toBe('value3');
});

it('should update access order when getting items', () => {
  const cache = new LRUCache<string>(2);

  cache.set('key1', 'value1');
  cache.set('key2', 'value2');

  // Access key1 to make it recently used
  cache.get('key1');

  // Add key3, which should evict key2 (least recently used)
  cache.set('key3', 'value3');

  expect(cache.get('key1')).toBe('value1');
  expect(cache.get('key2')).toBeUndefined();
  expect(cache.get('key3')).toBe('value3');
});

it('should update existing values', () => {
  const cache = new LRUCache<string>(2);

  cache.set('key1', 'value1');
  cache.set('key1', 'updated_value1');

  expect(cache.get('key1')).toBe('updated_value1');
});

it('should not evict entries when updating existing key at max capacity', () => {
  const cache = new LRUCache<string>(3);

  // Fill cache to max capacity
  cache.set('key1', 'value1');
  cache.set('key2', 'value2');
  cache.set('key3', 'value3');

  // Update an existing key
  cache.set('key2', 'updated_value2');

  // All three keys should still be in the cache
  expect(cache.get('key1')).toBe('value1');
  expect(cache.get('key2')).toBe('updated_value2');
  expect(cache.get('key3')).toBe('value3');
});

it('should work with complex objects', () => {
  type ComplexValue = {
    messages: Array<{id: string; message: string}>;
    source: string;
  };

  const cache = new LRUCache<ComplexValue>(2);

  const value1: ComplexValue = {
    messages: [{id: 'key1', message: 'Hello'}],
    source: 'const t = useTranslations(); t("Hello");'
  };

  cache.set('file1', value1);

  const retrieved = cache.get('file1');
  expect(retrieved).toEqual(value1);
  expect(retrieved?.messages[0].id).toBe('key1');
});
