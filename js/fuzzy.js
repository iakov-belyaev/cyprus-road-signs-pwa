// Pure fuzzy-matching helpers. No DOM, no side effects.

const VARIANT_MAP = {
  '&': ' and ',
  'no.': 'number',
  'st.': 'street',
  'rd.': 'road',
  'ave.': 'avenue',
  'km/h': 'kmh',
  'km/hr': 'kmh',
  'kph': 'kmh',
  'mph': 'kmh',
};

/**
 * Normalize a string for comparison:
 * lowercase, strip diacritics, remove punctuation, collapse whitespace,
 * and map common variants.
 */
export function normalize(str) {
  if (str == null) return '';
  let s = String(str).toLowerCase();

  // Map common variants before stripping punctuation.
  for (const [from, to] of Object.entries(VARIANT_MAP)) {
    s = s.split(from).join(to);
  }

  // Strip accents / diacritics (Greek and Latin).
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Remove punctuation (keep letters, numbers, spaces).
  s = s.replace(/[^\p{L}\p{N}\s]/gu, ' ');

  // Collapse whitespace and trim.
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}

/** Levenshtein edit distance between two strings. */
export function levenshtein(a, b) {
  a = a == null ? '' : String(a);
  b = b == null ? '' : String(b);
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = new Array(b.length + 1);
  let curr = new Array(b.length + 1);

  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,      // deletion
        curr[j - 1] + 1,  // insertion
        prev[j - 1] + cost // substitution
      );
    }
    const tmp = prev;
    prev = curr;
    curr = tmp;
  }

  return prev[b.length];
}

/** Similarity ratio in 0..1 (1 = identical). Symmetric. */
export function similarity(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  const maxLen = Math.max(na.length, nb.length);
  if (maxLen === 0) return 1;
  const dist = levenshtein(na, nb);
  return 1 - dist / maxLen;
}

/**
 * Determine whether a freeform user answer is correct for a sign.
 * Matches against official name, aliases, and Greek name, either exactly
 * (after normalization) or via similarity >= threshold.
 */
export function isAnswerCorrect(userInput, sign, { threshold = 0.82 } = {}) {
  if (!sign) return false;
  const input = normalize(userInput);
  if (!input) return false;

  const candidates = [];
  if (sign.name) candidates.push(sign.name);
  if (sign.nameEl) candidates.push(sign.nameEl);
  if (Array.isArray(sign.aliases)) candidates.push(...sign.aliases);

  for (const candidate of candidates) {
    const norm = normalize(candidate);
    if (!norm) continue;
    if (norm === input) return true;
    if (similarity(input, norm) >= threshold) return true;
  }

  return false;
}
