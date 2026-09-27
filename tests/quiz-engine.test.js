import { describe, it, expect } from 'vitest';
import {
  TEST_LENGTH,
  buildTest,
  buildOptions,
  recordAnswer,
  finishTest,
  accuracy,
  mostMissed,
} from '../js/quiz-engine.js';

function makeSigns(n) {
  const cats = ['warning', 'prohibitory', 'mandatory', 'info'];
  return Array.from({ length: n }, (_, i) => ({
    id: `sign-${i}`,
    name: `Sign ${i}`,
    nameEl: `Σήμα ${i}`,
    category: cats[i % cats.length],
    meaning: `Meaning ${i}`,
    aliases: [],
    image: `assets/signs/sign-${i}.svg`,
  }));
}

function seededRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const emptyState = () => ({
  weights: {},
  stats: { totalAnswered: 0, totalCorrect: 0, testsCompleted: 0, bestScore: 0 },
  history: [],
  missed: {},
  settings: { mode: 'multiple-choice' },
});

describe('buildTest', () => {
  it('returns exactly TEST_LENGTH distinct signs when catalog is large enough', () => {
    const signs = makeSigns(60);
    const test = buildTest(signs, {}, { rng: seededRng(1) });
    expect(test).toHaveLength(TEST_LENGTH);
    expect(new Set(test.map((s) => s.id)).size).toBe(TEST_LENGTH);
  });

  it('returns all signs when catalog is smaller than length', () => {
    const signs = makeSigns(10);
    const test = buildTest(signs, {}, { rng: seededRng(2) });
    expect(test).toHaveLength(10);
    expect(new Set(test.map((s) => s.id)).size).toBe(10);
  });

  it('favors high-weight signs over many seeded runs', () => {
    const signs = makeSigns(50);
    const weights = { 'sign-0': 100 };
    let count = 0;
    const runs = 200;
    for (let i = 0; i < runs; i++) {
      const test = buildTest(signs, weights, { length: 5, rng: seededRng(i + 1) });
      if (test.some((s) => s.id === 'sign-0')) count++;
    }
    // With weight 101 vs 1 for others, sign-0 should appear very often.
    expect(count).toBeGreaterThan(runs * 0.5);
  });
});

describe('buildOptions', () => {
  it('returns exactly 3 unique options with one correct answer', () => {
    const signs = makeSigns(20);
    const correct = signs[0];
    const options = buildOptions(correct, signs, { rng: seededRng(3) });
    expect(options).toHaveLength(3);
    expect(new Set(options.map((o) => o.id)).size).toBe(3);
    expect(options.filter((o) => o.id === correct.id)).toHaveLength(1);
  });

  it('prefers same-category distractors', () => {
    const signs = makeSigns(20);
    const correct = signs[0]; // category 'warning'
    const options = buildOptions(correct, signs, { rng: seededRng(4) });
    const distractors = options.filter((o) => o.id !== correct.id);
    expect(distractors.every((d) => d.category === correct.category)).toBe(true);
  });
});

describe('recordAnswer', () => {
  it('is pure (does not mutate the original state)', () => {
    const state = emptyState();
    const snapshot = JSON.stringify(state);
    recordAnswer(state, 'sign-0', false);
    expect(JSON.stringify(state)).toBe(snapshot);
  });

  it('increments weight and missed on incorrect', () => {
    const next = recordAnswer(emptyState(), 'sign-0', false);
    expect(next.weights['sign-0']).toBe(1);
    expect(next.missed['sign-0']).toBe(1);
    expect(next.stats.totalAnswered).toBe(1);
    expect(next.stats.totalCorrect).toBe(0);
  });

  it('decrements weight (floored at 0) on correct', () => {
    const state = emptyState();
    state.weights['sign-0'] = 2;
    const next = recordAnswer(state, 'sign-0', true);
    expect(next.weights['sign-0']).toBe(1);
    expect(next.stats.totalCorrect).toBe(1);

    const next2 = recordAnswer(next, 'sign-0', true);
    expect(next2.weights['sign-0']).toBe(0);
    const next3 = recordAnswer(next2, 'sign-0', true);
    expect(next3.weights['sign-0']).toBe(0);
  });
});

describe('finishTest', () => {
  it('updates testsCompleted, bestScore and prepends history', () => {
    const next = finishTest(emptyState(), {
      score: 20,
      total: 25,
      mode: 'multiple-choice',
      dateISO: '2024-01-01T00:00:00.000Z',
    });
    expect(next.stats.testsCompleted).toBe(1);
    expect(next.stats.bestScore).toBe(20);
    expect(next.history).toHaveLength(1);
    expect(next.history[0].score).toBe(20);
  });

  it('keeps the max bestScore', () => {
    const state = emptyState();
    state.stats.bestScore = 22;
    const next = finishTest(state, { score: 18, total: 25, mode: 'freeform', dateISO: 'x' });
    expect(next.stats.bestScore).toBe(22);
  });

  it('caps history at 50 entries', () => {
    let state = emptyState();
    for (let i = 0; i < 60; i++) {
      state = finishTest(state, { score: i, total: 25, mode: 'multiple-choice', dateISO: `d${i}` });
    }
    expect(state.history).toHaveLength(50);
    expect(state.history[0].score).toBe(59);
  });
});

describe('accuracy', () => {
  it('returns 0 when nothing answered', () => {
    expect(accuracy(emptyState())).toBe(0);
  });

  it('returns rounded percentage', () => {
    const state = emptyState();
    state.stats.totalAnswered = 3;
    state.stats.totalCorrect = 2;
    expect(accuracy(state)).toBe(67);
  });
});

describe('mostMissed', () => {
  it('returns top missed signs sorted desc, excluding zero counts', () => {
    const signs = makeSigns(5);
    const state = emptyState();
    state.missed = { 'sign-0': 3, 'sign-1': 5, 'sign-2': 0 };
    const result = mostMissed(state, signs, 5);
    expect(result).toHaveLength(2);
    expect(result[0].sign.id).toBe('sign-1');
    expect(result[0].count).toBe(5);
    expect(result[1].sign.id).toBe('sign-0');
  });

  it('respects the limit', () => {
    const signs = makeSigns(10);
    const state = emptyState();
    state.missed = { 'sign-0': 1, 'sign-1': 2, 'sign-2': 3, 'sign-3': 4 };
    expect(mostMissed(state, signs, 2)).toHaveLength(2);
  });
});
