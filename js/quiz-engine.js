// Pure quiz logic. No DOM, no side effects.

export const TEST_LENGTH = 25;

/** Fisher-Yates shuffle using the provided rng (returns a new array). */
function shuffle(arr, rng) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Select `length` distinct signs using weighted random sampling without
 * replacement. Weight for a sign = 1 + (weights[sign.id] || 0).
 */
export function buildTest(signs, weights = {}, { length = TEST_LENGTH, rng = Math.random } = {}) {
  const pool = Array.isArray(signs) ? signs.slice() : [];
  if (pool.length <= length) {
    return shuffle(pool, rng);
  }

  const selected = [];
  const remaining = pool.slice();

  while (selected.length < length && remaining.length > 0) {
    let total = 0;
    const w = remaining.map((s) => {
      const weight = 1 + (weights[s.id] || 0);
      const safe = weight > 0 ? weight : 0;
      total += safe;
      return safe;
    });

    let pick;
    if (total <= 0) {
      pick = Math.floor(rng() * remaining.length);
    } else {
      let r = rng() * total;
      pick = remaining.length - 1;
      for (let i = 0; i < remaining.length; i++) {
        r -= w[i];
        if (r < 0) {
          pick = i;
          break;
        }
      }
    }

    selected.push(remaining[pick]);
    remaining.splice(pick, 1);
  }

  return selected;
}

/**
 * Build `count` options: 1 correct + (count-1) distractors, preferring
 * same-category distractors, never duplicating the correct name.
 */
export function buildOptions(sign, allSigns, { count = 3, rng = Math.random } = {}) {
  const others = (Array.isArray(allSigns) ? allSigns : []).filter(
    (s) => s && sign && s.id !== sign.id && s.name !== sign.name
  );

  const sameCategory = others.filter((s) => s.category === sign.category);
  const differentCategory = others.filter((s) => s.category !== sign.category);

  const preferred = shuffle(sameCategory, rng);
  const fallback = shuffle(differentCategory, rng);
  const ordered = preferred.concat(fallback);

  const distractors = [];
  const usedNames = new Set([sign.name]);
  for (const candidate of ordered) {
    if (distractors.length >= count - 1) break;
    if (usedNames.has(candidate.name)) continue;
    usedNames.add(candidate.name);
    distractors.push(candidate);
  }

  const options = [sign, ...distractors];
  return shuffle(options, rng);
}

/** Deep-ish clone of the persisted state shape. */
function cloneState(state) {
  const s = state || {};
  return {
    weights: { ...(s.weights || {}) },
    stats: {
      totalAnswered: 0,
      totalCorrect: 0,
      testsCompleted: 0,
      bestScore: 0,
      ...(s.stats || {}),
    },
    history: Array.isArray(s.history) ? s.history.slice() : [],
    missed: { ...(s.missed || {}) },
    settings: { mode: 'multiple-choice', ...(s.settings || {}) },
  };
}

/**
 * Pure: returns a NEW state with the answer recorded.
 * Incorrect -> weight +1, missed +1. Correct -> weight -1 (floored at 0).
 */
export function recordAnswer(state, signId, isCorrect) {
  const next = cloneState(state);

  const currentWeight = next.weights[signId] || 0;
  if (isCorrect) {
    next.weights[signId] = Math.max(0, currentWeight - 1);
  } else {
    next.weights[signId] = currentWeight + 1;
    next.missed[signId] = (next.missed[signId] || 0) + 1;
  }

  next.stats.totalAnswered += 1;
  if (isCorrect) next.stats.totalCorrect += 1;

  return next;
}

/** Pure: returns a NEW state after finishing a test. */
export function finishTest(state, { score, total, mode, dateISO }) {
  const next = cloneState(state);

  next.stats.testsCompleted += 1;
  next.stats.bestScore = Math.max(next.stats.bestScore || 0, score || 0);

  const entry = {
    dateISO: dateISO || new Date().toISOString(),
    score: score || 0,
    total: total || 0,
    mode: mode || next.settings.mode,
  };

  next.history = [entry, ...next.history].slice(0, 50);

  return next;
}

/** Overall accuracy as a rounded 0..100 integer. */
export function accuracy(state) {
  const stats = (state && state.stats) || {};
  const answered = stats.totalAnswered || 0;
  if (answered <= 0) return 0;
  const correct = stats.totalCorrect || 0;
  return Math.round((correct / answered) * 100);
}

/** Top missed signs as [{ sign, count }], sorted desc, excluding zero. */
export function mostMissed(state, signs, limit = 5) {
  const missed = (state && state.missed) || {};
  const byId = new Map((Array.isArray(signs) ? signs : []).map((s) => [s.id, s]));

  const result = [];
  for (const [id, count] of Object.entries(missed)) {
    if (!count || count <= 0) continue;
    const sign = byId.get(id);
    if (!sign) continue;
    result.push({ sign, count });
  }

  result.sort((a, b) => b.count - a.count);
  return result.slice(0, limit);
}
