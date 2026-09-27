import { describe, it, expect } from 'vitest';
import {
  CATEGORIES,
  SIGNS,
  getSignById,
  getSignsByCategory,
  searchSigns,
} from '../js/signs-data.js';

const CATEGORY_IDS = ['warning', 'prohibitory', 'mandatory', 'info'];

describe('CATEGORIES', () => {
  it('exposes exactly the 4 official categories with stable ids', () => {
    expect(CATEGORIES).toHaveLength(4);
    expect(CATEGORIES.map((c) => c.id)).toEqual(CATEGORY_IDS);
  });

  it('gives every category a label and a color', () => {
    for (const cat of CATEGORIES) {
      expect(typeof cat.label).toBe('string');
      expect(cat.label.length).toBeGreaterThan(0);
      expect(cat.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe('SIGNS', () => {
  it('contains at least 40 signs', () => {
    expect(SIGNS.length).toBeGreaterThanOrEqual(40);
  });

  it('has unique ids', () => {
    const ids = SIGNS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every sign the full required shape', () => {
    for (const sign of SIGNS) {
      expect(typeof sign.id).toBe('string');
      expect(sign.id.length).toBeGreaterThan(0);
      expect(typeof sign.name).toBe('string');
      expect(sign.name.length).toBeGreaterThan(0);
      expect(typeof sign.nameEl).toBe('string');
      expect(sign.nameEl.length).toBeGreaterThan(0);
      expect(CATEGORY_IDS).toContain(sign.category);
      expect(typeof sign.meaning).toBe('string');
      expect(sign.meaning.length).toBeGreaterThan(0);
      expect(Array.isArray(sign.aliases)).toBe(true);
      expect(sign.image).toBe(`assets/signs/${sign.id}.svg`);
    }
  });

  it('covers every category with at least one sign', () => {
    for (const id of CATEGORY_IDS) {
      expect(SIGNS.some((s) => s.category === id)).toBe(true);
    }
  });
});

describe('getSignById', () => {
  it('returns the matching sign', () => {
    const first = SIGNS[0];
    expect(getSignById(first.id)).toBe(first);
  });

  it('returns null for unknown ids', () => {
    expect(getSignById('does-not-exist')).toBeNull();
    expect(getSignById(undefined)).toBeNull();
  });
});

describe('getSignsByCategory', () => {
  it('returns only signs in the requested category', () => {
    const warning = getSignsByCategory('warning');
    expect(warning.length).toBeGreaterThan(0);
    expect(warning.every((s) => s.category === 'warning')).toBe(true);
  });

  it('returns an empty array for an unknown category', () => {
    expect(getSignsByCategory('nope')).toEqual([]);
  });
});

describe('searchSigns', () => {
  it('returns a copy of all signs for an empty query', () => {
    const all = searchSigns('');
    expect(all).toHaveLength(SIGNS.length);
    expect(all).not.toBe(SIGNS);
  });

  it('matches by official name, case-insensitively', () => {
    const results = searchSigns('bend to the right');
    expect(results.some((s) => s.id === 'warning-bend-right')).toBe(true);
  });

  it('matches by alias', () => {
    const results = searchSigns('zebra crossing');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((s) => {
      const haystack = [s.name, s.nameEl, s.meaning, ...(s.aliases || [])]
        .join(' ')
        .toLowerCase();
      return haystack.includes('zebra crossing');
    })).toBe(true);
  });

  it('matches by Greek name', () => {
    const results = searchSigns('Στροφή');
    expect(results.some((s) => s.id === 'warning-bend-right')).toBe(true);
  });

  it('matches by meaning text', () => {
    const results = searchSigns('roundabout');
    expect(results.length).toBeGreaterThan(0);
  });

  it('matches by category label', () => {
    const results = searchSigns('prohibitory signs');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((s) => s.category === 'prohibitory')).toBe(true);
  });

  it('returns an empty array when nothing matches', () => {
    expect(searchSigns('zzzzzzzz-no-such-sign')).toEqual([]);
  });
});
