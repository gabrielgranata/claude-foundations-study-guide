// ═══════════════════════════════════════════════════════
// APP STATE — useReducer + localStorage sync
// ═══════════════════════════════════════════════════════

import { useReducer, useEffect, useCallback } from 'react';
import { loadState, saveState, loadApiKey, saveApiKey, clearApiKey } from '../lib/storage.js';
import { STAGE_ORDER } from '../data/knowledge.js';

const initialState = () => ({
  ...loadState(),
  apiKey: loadApiKey(),
});

function reducer(state, action) {
  switch (action.type) {
    case 'SET_API_KEY': {
      if (action.key) {
        saveApiKey(action.key);
      } else {
        clearApiKey();
      }
      return { ...state, apiKey: action.key };
    }

    case 'UPDATE_CONCEPT_STAGE': {
      const { conceptId, stage } = action;
      const concept = state.concepts[conceptId];
      if (!concept) return state;
      const updated = {
        ...state,
        concepts: {
          ...state.concepts,
          [conceptId]: {
            ...concept,
            stage,
            times_studied: concept.times_studied + (stage !== concept.stage ? 0 : 0),
          },
        },
      };
      saveState(updated);
      return updated;
    }

    case 'UPDATE_CONCEPTS_BATCH': {
      // action.updates: { conceptId: stage, ... }
      const newConcepts = { ...state.concepts };
      Object.entries(action.updates).forEach(([id, stage]) => {
        if (newConcepts[id]) {
          newConcepts[id] = { ...newConcepts[id], stage };
        }
      });
      const updated = { ...state, concepts: newConcepts };
      saveState(updated);
      return updated;
    }

    case 'UPDATE_CONCEPT_SM2': {
      const updated = {
        ...state,
        concepts: {
          ...state.concepts,
          [action.conceptId]: action.concept,
        },
      };
      saveState(updated);
      return updated;
    }

    case 'INCREMENT_TIMES_STUDIED': {
      const concept = state.concepts[action.conceptId];
      if (!concept) return state;
      const updated = {
        ...state,
        concepts: {
          ...state.concepts,
          [action.conceptId]: {
            ...concept,
            times_studied: (concept.times_studied || 0) + 1,
          },
        },
      };
      saveState(updated);
      return updated;
    }

    case 'ADD_SESSION': {
      const updated = {
        ...state,
        sessions: [action.session, ...state.sessions].slice(0, 50),
      };
      saveState(updated);
      return updated;
    }

    case 'RESET_PROGRESS': {
      const { concepts, sessions } = loadState(); // triggers rebuild
      const fresh = {
        ...state,
        concepts: Object.keys(state.concepts).reduce((acc, id) => {
          acc[id] = {
            ...state.concepts[id],
            stage: 'UNSEEN',
            ease_factor: 2.5,
            interval_days: 0,
            repetitions: 0,
            next_review: null,
            last_reviewed: null,
            times_studied: 0,
          };
          return acc;
        }, {}),
        sessions: [],
      };
      saveState(fresh);
      return fresh;
    }

    default:
      return state;
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(reducer, null, initialState);
  return { state, dispatch };
}
