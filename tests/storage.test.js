import { describe, it, expect } from 'vitest';
import { createStore, mergeDefaults, DEFAULT_STATE, ROOT_KEY } from '../js/storage.js';

function fakeBackend() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: (k) => { map.delete(k); },
    key: (i) => Array.from(map.keys())[i] ?? null,
    get length() { return map.size; },
    _map: map,
  };
}

describe('createStore', () => {
  it('works against a fake in-memory backend', () => {
    const store = createStore(fakeBackend(), 'cyrs');
    store.set('foo', { a: 1 });
    expect(store.get('foo')).toEqual({ a: 1 });
  });

  it('returns fallback for missing keys', () => {
    const store = createStore(fakeBackend(), 'cyrs');
    expect(store.get('missing', 'fallback')).toBe('fallback');
  });

  it('returns fallback for corrupt JSON', () => {
    const backend = fakeBackend();
    backend.setItem('cyrs:bad', '{not valid json');
    const store = createStore(backend, 'cyrs');
    expect(store.get('bad', 'fallback')).toBe('fallback');
  });

  it('round-trips objects', () => {
    const store = createStore(fakeBackend(), 'cyrs');
    const value = { nested: { list: [1, 2, 3] }, flag: true };
    store.set('obj', value);
    expect(store.get('obj')).toEqual(value);
  });

  it('clearAll removes only namespaced keys', () => {
    const backend = fakeBackend();
    backend.setItem('other:keep', 'yes');
    const store = createStore(backend, 'cyrs');
    store.set('a', 1);
    store.set('b', 2);
    store.clearAll();
    expect(store.get('a')).toBeNull();
    expect(store.get('b')).toBeNull();
    expect(backend.getItem('other:keep')).toBe('yes');
  });

  it('never throws when backend is unavailable', () => {
    const store = createStore(null, 'cyrs');
    expect(store.get('x', 'fb')).toBe('fb');
    expect(store.set('x', 1)).toBe(false);
    expect(store.remove('x')).toBe(false);
    expect(store.clearAll()).toBe(false);
  });
});

describe('mergeDefaults', () => {
  it('fills a partial legacy state with defaults', () => {
    const merged = mergeDefaults({ stats: { totalAnswered: 5 } });
    expect(merged.stats.totalAnswered).toBe(5);
    expect(merged.stats.totalCorrect).toBe(0);
    expect(merged.stats.testsCompleted).toBe(0);
    expect(merged.stats.bestScore).toBe(0);
    expect(merged.weights).toEqual({});
    expect(merged.history).toEqual([]);
    expect(merged.missed).toEqual({});
    expect(merged.settings.mode).toBe('multiple-choice');
  });

  it('handles null/undefined input', () => {
    expect(mergeDefaults(null)).toEqual(DEFAULT_STATE);
    expect(mergeDefaults(undefined)).toEqual(DEFAULT_STATE);
  });
});

describe('getState/setState', () => {
  it('persists and reads back the root state', () => {
    const store = createStore(fakeBackend(), 'cyrs');
    const state = store.getState();
    state.stats.totalAnswered = 7;
    store.setState(state);
    expect(store.getState().stats.totalAnswered).toBe(7);
    expect(store.get(ROOT_KEY).stats.totalAnswered).toBe(7);
  });
});
