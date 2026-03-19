// ═══════════════════════════════════════════════════════
// STORAGE — server-backed with localStorage cache
// ═══════════════════════════════════════════════════════

import { CONCEPTS } from '../data/knowledge.js';

const STORAGE_KEY = 'cca_study_guide_v1';

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

// ── Server sync helpers ───────────────────────────────
async function serverGet(key) {
  try {
    const res = await fetch(`/api/state/${key}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.value;
  } catch { return null; }
}

async function serverSet(key, value) {
  try {
    await fetch(`/api/state/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
  } catch (e) {
    console.warn('Server sync failed:', e.message);
  }
}

async function serverDelete(key) {
  try {
    await fetch(`/api/state/${key}`, { method: 'DELETE' });
  } catch {}
}

// ── Load from server on startup, fall back to localStorage ──
export async function loadStateFromServer() {
  try {
    const res = await fetch('/api/state');
    if (!res.ok) throw new Error('server unavailable');
    const all = await res.json();

    // If server has state, use it and update localStorage cache
    if (all[STORAGE_KEY]) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all[STORAGE_KEY]));
    }

    // Sync extra state keys
    Object.entries(all).forEach(([k, v]) => {
      if (k !== STORAGE_KEY) {
        localStorage.setItem(k, JSON.stringify(v));
      }
    });

    return true;
  } catch {
    return false; // offline — localStorage only
  }
}

// ── Core state ────────────────────────────────────────
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { concepts: buildInitialConcepts(), sessions: [] };
    }
    const parsed = JSON.parse(raw);
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
    return { concepts, sessions: parsed.sessions || [] };
  } catch {
    return { concepts: buildInitialConcepts(), sessions: [] };
  }
}

export function saveState(state) {
  const data = { concepts: state.concepts, sessions: state.sessions };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save state:', e);
  }
  // Write-through to server (fire and forget)
  serverSet(STORAGE_KEY, data);
}

// ── Extra state (references, chats, exam results) ─────
export function loadExtraState(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function saveExtraState(key, value) {
  try {
    if (value === null) {
      localStorage.removeItem(key);
      serverDelete(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
      serverSet(key, value);
    }
  } catch (e) {
    console.warn(`Failed to save ${key}:`, e);
  }
}

export function resetAllProgress() {
  try {
    // Clear all cca_ keys from localStorage
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('cca_') || k === STORAGE_KEY)) keys.push(k);
    }
    keys.forEach(k => {
      localStorage.removeItem(k);
      serverDelete(k);
    });
  } catch {}
}
