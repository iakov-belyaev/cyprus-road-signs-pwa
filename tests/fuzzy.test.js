import { describe, it, expect } from 'vitest';
import { normalize, levenshtein, similarity, isAnswerCorrect } from '../js/fuzzy.js';

const sign = {
  id: 'warning-bend-right',
  name: 'Bend to the Right',
  nameEl: 'Στροφή προς τα δεξιά',
  aliases: ['right bend', 'curve right'],
};

describe('normalize', () => {
  it('lowercases and trims', () => {
    expect(normalize('  Hello World  ')).toBe('hello world');
  });

  it('strips accents and diacritics', () => {
    expect(normalize('Café')).toBe('cafe');
    expect(normalize('Στροφή')).toBe('στροφη');
  });

  it('removes punctuation and collapses whitespace', () => {
    expect(normalize('Bend,  to   the-Right!')).toBe('bend to the right');
  });

  it('handles null/undefined safely', () => {
    expect(normalize(null)).toBe('');
    expect(normalize(undefined)).toBe('');
  });
});

describe('levenshtein', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshtein('abc', 'abc')).toBe(0);
  });

  it('computes edit distance', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
  });
});

describe('similarity', () => {
  it('returns 1 for identical strings', () => {
    expect(similarity('hello', 'hello')).toBe(1);
  });

  it('is symmetric', () => {
    expect(similarity('kitten', 'sitting')).toBeCloseTo(similarity('sitting', 'kitten'), 10);
  });

  it('returns a value between 0 and 1', () => {
    const s = similarity('abc', 'xyz');
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(1);
  });
});

describe('isAnswerCorrect', () => {
  it('accepts the exact official name', () => {
    expect(isAnswerCorrect('Bend to the Right', sign)).toBe(true);
  });

  it('accepts case and punctuation differences', () => {
    expect(isAnswerCorrect('  bend to the right! ', sign)).toBe(true);
  });

  it('accepts an alias', () => {
    expect(isAnswerCorrect('right bend', sign)).toBe(true);
  });

  it('accepts the Greek name', () => {
    expect(isAnswerCorrect('Στροφή προς τα δεξιά', sign)).toBe(true);
  });

  it('accepts near-miss typos at threshold', () => {
    expect(isAnswerCorrect('bend to the rigth', sign)).toBe(true);
  });

  it('rejects unrelated strings', () => {
    expect(isAnswerCorrect('no entry', sign)).toBe(false);
  });

  it('rejects empty input', () => {
    expect(isAnswerCorrect('', sign)).toBe(false);
  });
});
