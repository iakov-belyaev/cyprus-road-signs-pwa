// Pluggable storage wrapper with JSON safety and default merging.

export const ROOT_KEY = 'cyrs:state';

export const DEFAULT_STATE = {
  weights: {},
  stats: {
    totalAnswered: 0,
    totalCorrect: 0,
    testsCompleted: 0,
    bestScore: 0,
  },
  history: [],
  missed: {},
  settings: {
    mode: 'multiple-choice',
  },
};

/** Merge a (possibly partial/legacy) state with defaults. */
export function mergeDefaults(state) {
  const s = state && typeof state === 'object' ? state : {};
  return {
    weights: { ...(s.weights && typeof s.weights === 'object' ? s.weights : {}) },
    stats: { ...DEFAULT_STATE.stats, ...(s.stats && typeof s.stats === 'object' ? s.stats : {}) },
    history: Array.isArray(s.history) ? s.history : [],
    missed: { ...(s.missed && typeof s.missed === 'object' ? s.missed : {}) },
    settings: { ...DEFAULT_STATE.settings, ...(s.settings && typeof s.settings === 'object' ? s.settings : {}) },
  };
}

/**
 * Create a namespaced store over a pluggable backend (defaults to
 * localStorage). Never throws on corrupt data.
 */
export function createStore(backend = globalThis.localStorage, namespace = 'cyrs') {
  const prefix = `${namespace}:`;

  function fullKey(key) {
    return `${prefix}${key}`;
  }

  function safeBackend() {
    return backend && typeof backend.getItem === 'function' ? backend : null;
  }

  return {
    get(key, fallback = null) {
      const be = safeBackend();
      if (!be) return fallback;
      try {
        const raw = be.getItem(fullKey(key));
        if (raw == null) return fallback;
        return JSON.parse(raw);
      } catch {
        return fallback;
      }
    },

    set(key, value) {
      const be = safeBackend();
      if (!be) return false;
      try {
        be.setItem(fullKey(key), JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },

    remove(key) {
      const be = safeBackend();
      if (!be) return false;
      try {
        be.removeItem(fullKey(key));
        return true;
      } catch {
        return false;
      }
    },

    clearAll() {
      const be = safeBackend();
      if (!be) return false;
      try {
        const keys = [];
        for (let i = 0; i < be.length; i++) {
          const k = be.key(i);
          if (k != null && k.startsWith(prefix)) keys.push(k);
        }
        keys.forEach((k) => be.removeItem(k));
        return true;
      } catch {
        return false;
      }
    },

    /** Read the root state, merged with defaults. */
    getState() {
      return mergeDefaults(this.get(ROOT_KEY, null));
    },

    /** Persist the root state. */
    setState(state) {
      return this.set(ROOT_KEY, mergeDefaults(state));
    },
  };
}
