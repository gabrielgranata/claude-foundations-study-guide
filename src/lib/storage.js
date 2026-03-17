// ═══════════════════════════════════════════════════════
// STORAGE — localStorage management
// ═══════════════════════════════════════════════════════

import { CONCEPTS, DOMAINS } from '../data/knowledge.js';

const STORAGE_KEY = 'cca_study_guide_v1';
const API_KEY_STORAGE = 'cca_api_key_v1';

function buildInitialConcepts() {
  const concepts = {};
  Object.keys(CONCEPTS).forEach(id => {
    concepts[id] = {
      id,
      domainId: CONCEPTS[id].domainId,
      stage: 'UNSEEN',
      ease_factor: 2.5,
      interval_days: 0,
      repetitions: 0,
      next_review: null,
      last_reviewed: null,
      times_studied: 0,
    };
  });
  return concepts;
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { concepts: buildInitialConcepts(), sessions: [] };
    }
    const parsed = JSON.parse(raw);
    // Ensure all concepts exist (in case new ones added)
    const concepts = parsed.concepts || {};
    Object.keys(CONCEPTS).forEach(id => {
      if (!concepts[id]) {
        concepts[id] = {
          id,
          domainId: CONCEPTS[id].domainId,
          stage: 'UNSEEN',
          ease_factor: 2.5,
          interval_days: 0,
          repetitions: 0,
          next_review: null,
          last_reviewed: null,
          times_studied: 0,
        };
      }
    });
    return {
      concepts,
      sessions: parsed.sessions || [],
    };
  } catch {
    return { concepts: buildInitialConcepts(), sessions: [] };
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      concepts: state.concepts,
      sessions: state.sessions,
    }));
  } catch (e) {
    console.warn('Failed to save state:', e);
  }
}

export function loadApiKey() {
  try {
    return localStorage.getItem(API_KEY_STORAGE) || null;
  } catch {
    return null;
  }
}

export function saveApiKey(key) {
  try {
    localStorage.setItem(API_KEY_STORAGE, key);
  } catch (e) {
    console.warn('Failed to save API key:', e);
  }
}

export function clearApiKey() {
  try {
    localStorage.removeItem(API_KEY_STORAGE);
  } catch {}
}

export function resetAllProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
