import { describe, it, expect } from 'vitest';
import { SIGNS } from '../js/signs-data.js';

/**
 * The catalog stores image paths as `assets/signs/<id>.svg`. The UI is
 * responsible for rendering a placeholder when an image is missing, so the
 * pure-data contract we can test here is that every path is well-formed,
 * unique, and derived from the sign id.
 */

const IMAGE_PATH_RE = /^assets\/signs\/[a-z0-9-]+\.svg$/;

describe('sign image paths', () => {
  it('uses the assets/signs/<id>.svg convention for every sign', () => {
    for (const sign of SIGNS) {
      expect(sign.image).toMatch(IMAGE_PATH_RE);
      expect(sign.image).toBe(`assets/signs/${sign.id}.svg`);
    }
  });

  it('never produces duplicate image paths', () => {
    const paths = SIGNS.map((s) => s.image);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('uses lowercase, slug-safe ids so paths stay portable', () => {
    for (const sign of SIGNS) {
      expect(sign.id).toBe(sign.id.toLowerCase());
      expect(sign.id).toMatch(/^[a-z0-9-]+$/);
    }
  });
});

describe('placeholder fallback contract', () => {
  /**
   * Mirrors the initials logic used by the UI placeholder: take the first
   * letter of up to two words of the sign name, uppercased.
   */
  function initials(name) {
    return String(name || '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('');
  }

  it('derives non-empty initials for every sign name', () => {
    for (const sign of SIGNS) {
      const result = initials(sign.name);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toBe(result.toUpperCase());
    }
  });

  it('handles empty or missing names without throwing', () => {
    expect(initials('')).toBe('');
    expect(initials(null)).toBe('');
    expect(initials(undefined)).toBe('');
  });

  it('produces at most two characters', () => {
    for (const sign of SIGNS) {
      expect(initials(sign.name).length).toBeLessThanOrEqual(2);
    }
  });
});
