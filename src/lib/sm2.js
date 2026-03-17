// ═══════════════════════════════════════════════════════
// SM-2 SPACED REPETITION ALGORITHM
// ═══════════════════════════════════════════════════════

/**
 * Update SM-2 state for a concept after a review.
 * quality: 0-5 (0=blackout, 5=perfect recall)
 */
export function updateSM2(concept, quality) {
  let { ease_factor, interval_days, repetitions } = concept;

  if (quality >= 3) {
    if (repetitions === 0) interval_days = 1;
    else if (repetitions === 1) interval_days = 6;
    else interval_days = Math.round(interval_days * ease_factor);
    repetitions += 1;
  } else {
    repetitions = 0;
    interval_days = 1;
  }

  ease_factor = Math.max(
    1.3,
    ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );

  const now = new Date();
  const next_review = new Date(now.getTime() + interval_days * 24 * 60 * 60 * 1000);

  return {
    ...concept,
    ease_factor: Math.round(ease_factor * 1000) / 1000,
    interval_days,
    repetitions,
    next_review: next_review.toISOString(),
    last_reviewed: now.toISOString(),
    // Failed reviews drop back to TENSION
    stage: quality < 3 ? 'TENSION' : concept.stage,
  };
}

/**
 * Get concepts due for review (next_review <= now).
 * Only PATTERN and INTEGRATION concepts enter the review queue.
 */
export function getDueConcepts(concepts) {
  const now = new Date();
  return Object.values(concepts).filter(c => {
    if (c.stage !== 'PATTERN' && c.stage !== 'INTEGRATION') return false;
    if (!c.next_review) return true; // never reviewed yet
    return new Date(c.next_review) <= now;
  });
}

/**
 * Format next review date in a human-readable way.
 */
export function formatNextReview(isoDate) {
  if (!isoDate) return 'not scheduled';
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = date - now;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays < 7) return `in ${diffDays} days`;
  if (diffDays < 14) return 'in 1 week';
  return `in ${Math.round(diffDays / 7)} weeks`;
}

export const QUALITY_DESCRIPTIONS = [
  { q: 0, label: 'Blackout',   desc: "Couldn't recall at all" },
  { q: 1, label: 'Wrong',      desc: 'Wrong, but recognized when explained' },
  { q: 2, label: 'Familiar',   desc: 'Wrong, but concept felt familiar' },
  { q: 3, label: 'Hard',       desc: 'Correct with significant difficulty' },
  { q: 4, label: 'Hesitant',   desc: 'Correct with some hesitation' },
  { q: 5, label: 'Perfect',    desc: 'Perfect, immediate recall' },
];
