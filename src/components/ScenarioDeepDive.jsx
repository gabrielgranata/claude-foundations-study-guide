import { useState } from 'react';
import { SCENARIOS, CONCEPTS, STAGES, DOMAINS } from '../data/knowledge.js';
import { getScenarioPrompt } from '../lib/prompts.js';
import { ConversationInterface } from './ConversationInterface.jsx';
import { PostSessionReview } from './PostSessionReview.jsx';

import { loadExtraState, saveExtraState } from '../lib/storage.js';

function ScenarioPicker({ scenarios, selectedId, onSelect }) {
  return (
    <div style={{ padding: '20px 24px', flex: 1, overflowY: 'auto' }}>
      <div className="view-header" style={{ padding: '0 0 16px', border: 'none' }}>
        <span className="view-title"><span>SCENARIO</span> DEEP DIVE</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
          Extended Socratic session on exam scenarios
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {scenarios.map(s => (
          <div
            key={s.id}
            className={`scenario-card${selectedId === s.id ? ' selected' : ''}`}
            onClick={() => onSelect(s.id)}
          >
            <div className="scenario-card-id">{s.id}</div>
            <div className="scenario-card-name">{s.name}</div>
            <div className="scenario-card-desc">{s.description}</div>
            <div className="scenario-card-tags">
              {s.primaryDomains.map(d => (
                <span key={d} className="tag domain">D{d}</span>
              ))}
              {s.keyConcepts.map(c => (
                <span key={c} className="tag concept">{c}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScenarioSidebar({ scenario, concepts }) {
  return (
    <div className="session-sidebar">
      <div className="session-sidebar-header">
        {scenario.id} — Context
      </div>
      <div className="session-sidebar-scroll">
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Key Concepts
          </div>
          <div className="concept-list">
            {scenario.keyConcepts.map(id => {
              const stage = concepts[id]?.stage || 'UNSEEN';
              const s = STAGES[stage];
              return (
                <div key={id} className="concept-row">
                  <span className="concept-stage-symbol" style={{ color: s.color }}>{s.symbol}</span>
                  <span className="concept-id">{id}</span>
                  <span className="concept-desc">{CONCEPTS[id]?.description || id}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="divider" />

        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Primary Domains
          </div>
          {scenario.primaryDomains.map(dId => {
            const domain = DOMAINS.find(d => d.id === dId);
            return (
              <div key={dId} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-blue)', marginBottom: '4px' }}>
                D{dId} · {domain?.name}
              </div>
            );
          })}
        </div>

        <div className="divider" />

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', lineHeight: '1.4', marginTop: '8px' }}>
          Type <span style={{ color: 'var(--accent-teal)' }}>gap analysis</span> in the session to get an honest assessment of what you've addressed.
        </div>
      </div>
    </div>
  );
}

export function ScenarioDeepDive({ state, dispatch, navigate, params }) {
  const [selectedId, setSelectedId] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [showPostSession, setShowPostSession] = useState(false);
  const [sessionId] = useState(() => Date.now());

  const scenario = SCENARIOS.find(s => s.id === selectedId);
  const chatKey = selectedId ? `chat_scenario-${selectedId}` : null;
  const hasSavedSession = chatKey ? !!loadExtraState(chatKey, null) : false;

  function handleStartSession(resume = false) {
    if (!resume && chatKey) {
      saveExtraState(chatKey, null);
    }
    const updates = {};
    scenario.keyConcepts.forEach(id => {
      if ((state.concepts[id]?.stage || 'UNSEEN') === 'UNSEEN') {
        updates[id] = 'ENCOUNTER';
      }
    });
    if (Object.keys(updates).length > 0) {
      dispatch({ type: 'UPDATE_CONCEPTS_BATCH', updates });
    }
    setSessionActive(true);
  }

  function handleEndSession() {
    setSessionActive(false);
    setShowPostSession(true);
  }

  function handleCommand(cmd, ...args) {
    if (cmd === 'status') {
      const lines = scenario.keyConcepts.map(id => {
        const stage = state.concepts[id]?.stage || 'UNSEEN';
        return `${id}  ${STAGES[stage].symbol} ${stage}  ${CONCEPTS[id]?.description || ''}`;
      });
      return lines.join('\n');
    }
    if (cmd === 'advance') {
      const [conceptId, stage] = args;
      const validStages = ['UNSEEN', 'ENCOUNTER', 'TENSION', 'PATTERN', 'INTEGRATION'];
      if (!validStages.includes(stage)) return `Invalid stage: ${stage}`;
      if (!CONCEPTS[conceptId]) return `Unknown concept: ${conceptId}`;
      dispatch({ type: 'UPDATE_CONCEPT_STAGE', conceptId, stage });
      return `${conceptId} → ${STAGES[stage].symbol} ${stage}`;
    }
  }

  function handlePostSessionSave(updates) {
    dispatch({ type: 'UPDATE_CONCEPTS_BATCH', updates });
    dispatch({
      type: 'ADD_SESSION',
      session: {
        id: sessionId,
        started_at: new Date(sessionId).toISOString(),
        ended_at: new Date().toISOString(),
        type: 'scenario',
        label: scenario.name,
        concepts_touched: scenario.keyConcepts,
      },
    });
    setShowPostSession(false);
    navigate('dashboard');
  }

  if (!sessionActive && !showPostSession) {
    return (
      <div className="view" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
        <ScenarioPicker
          scenarios={SCENARIOS}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        {selectedId && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-panel)', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                  Selected: {scenario?.id}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {scenario?.name}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {hasSavedSession && (
                  <button className="btn btn-primary" onClick={() => handleStartSession(true)}>
                    Resume →
                  </button>
                )}
                <button className={`btn ${hasSavedSession ? 'btn-secondary' : 'btn-primary'}`} onClick={() => handleStartSession(false)}>
                  {hasSavedSession ? 'New Session' : 'Begin Deep Dive →'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="view" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
        <div className="session-header">
          <div className="session-header-left">
            <span className="session-header-type" style={{ color: 'var(--accent-blue)', background: 'var(--accent-blue-dim)', borderColor: 'rgba(90,140,200,0.2)' }}>
              {scenario?.id}
            </span>
            <span className="session-header-title">{scenario?.name}</span>
          </div>
          <div className="session-header-actions">
            <button className="btn btn-secondary" onClick={handleEndSession}>
              End Session
            </button>
          </div>
        </div>

        <div className="session-layout" style={{ flex: 1, overflow: 'hidden' }}>
          <div className="session-main">
            <ConversationInterface
              sessionKey={`scenario-${selectedId}`}
              systemPrompt={scenario ? getScenarioPrompt(scenario) : ''}
              initialMessage={`Begin the scenario deep dive for "${scenario?.name}". Present the initial high-level requirement incrementally.`}
              onCommand={handleCommand}
              sessionActive={sessionActive}
              onEndSession={handleEndSession}
            />
          </div>
          {scenario && (
            <ScenarioSidebar scenario={scenario} concepts={state.concepts} />
          )}
        </div>
      </div>

      {showPostSession && (
        <PostSessionReview
          conceptIds={scenario?.keyConcepts || []}
          currentConcepts={state.concepts}
          onSave={handlePostSessionSave}
          onDismiss={() => { setShowPostSession(false); navigate('dashboard'); }}
        />
      )}
    </>
  );
}
