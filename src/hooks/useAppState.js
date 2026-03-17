// ═══════════════════════════════════════════════════════
// APP STATE — useReducer + localStorage sync
// ═══════════════════════════════════════════════════════

import { useReducer } from 'react';
import { loadState, saveState, loadExtraState, saveExtraState } from '../lib/storage.js';

const initialState = () => ({
  ...loadState(),
  // Reference cache: { conceptId: { content, generatedAt } }
  referenceCache: loadExtraState('referenceCache', {}),
  // Exam intel cache: { content, generatedAt }
  examIntel: loadExtraState('examIntel', null),
  // Practice exam results: [{ questions, answers, score, completedAt, domainFilter }]
  examResults: loadExtraState('examResults', []),
});

function reducer(state, action) {
  switch (action.type) {
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

    case 'CACHE_REFERENCE': {
      const newCache = {
        ...state.referenceCache,
        [action.conceptId]: { content: action.content, generatedAt: new Date().toISOString() },
      };
      saveExtraState('referenceCache', newCache);
      return { ...state, referenceCache: newCache };
    }

    case 'SET_EXAM_INTEL': {
      const intel = { content: action.content, generatedAt: new Date().toISOString() };
      saveExtraState('examIntel', intel);
      return { ...state, examIntel: intel };
    }

    case 'ADD_EXAM_RESULT': {
      const results = [action.result, ...state.examResults].slice(0, 20);
      saveExtraState('examResults', results);
      return { ...state, examResults: results };
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
