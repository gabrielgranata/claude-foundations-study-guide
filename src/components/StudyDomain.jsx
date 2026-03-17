import { useState } from 'react';
import { DOMAINS, CONCEPTS, STAGES } from '../data/knowledge.js';
import { getStudyPrompt } from '../lib/prompts.js';
import { ConversationInterface } from './ConversationInterface.jsx';
import { PostSessionReview } from './PostSessionReview.jsx';
import { ConceptRow, StageSymbol } from './ConceptBadge.jsx';

function DomainPicker({ domains, concepts, selectedId, onSelect }) {
  return (
    <div style={{ padding: '20px 24px', flex: 1, overflowY: 'auto' }}>
      <div className="view-header" style={{ padding: '0 0 16px', border: 'none' }}>
        <span className="view-title"><span>STUDY</span> DOMAIN</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
          Select a domain to study
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {domains.map(domain => {
          const ids = domain.conceptIds;
          const stageCounts = { UNSEEN: 0, ENCOUNTER: 0, TENSION: 0, PATTERN: 0, INTEGRATION: 0 };
          ids.forEach(id => {
            const stage = concepts[id]?.stage || 'UNSEEN';
            stageCounts[stage]++;
          });
          const progress = ids.filter(id => (concepts[id]?.stage || 'UNSEEN') !== 'UNSEEN').length;

          return (
            <div
              key={domain.id}
              className={`picker-card${selectedId === domain.id ? ' selected' : ''}`}
              onClick={() => onSelect(domain.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="picker-card-id">DOMAIN {domain.id} · {domain.weight}%</div>
                  <div className="picker-card-name">{domain.name}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right' }}>
                  <div>{ids.length} concepts</div>
                  <div style={{ color: 'var(--accent-teal)', marginTop: '2px' }}>{progress} started</div>
                </div>
              </div>

              {/* Stage breakdown */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                {Object.entries(stageCounts).filter(([,n])=>n>0).map(([stage, count]) => (
                  <span key={stage} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: STAGES[stage].color, display: 'flex', alignItems: 'center', gap: '3px' }}>
                    {STAGES[stage].symbol} {count}
                  </span>
                ))}
              </div>

              <div className="picker-card-progress" style={{ marginTop: '8px' }}>
                <div
                  className="picker-card-progress-fill"
                  style={{ width: `${(progress / ids.length) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SessionSidebar({ domain, concepts, conceptsTouched }) {
  return (
    <div className="session-sidebar">
      <div className="session-sidebar-header">
        D{domain.id} — {domain.name.split('&')[0].trim()}
      </div>
      <div className="session-sidebar-scroll">
        <div className="concept-list">
          {domain.conceptIds.map(id => (
            <ConceptRow
              key={id}
              conceptId={id}
              conceptState={concepts[id]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function StudyDomain({ state, dispatch, navigate, params }) {
  const [selectedDomainId, setSelectedDomainId] = useState(params?.highlightDomain || null);
  const [sessionActive, setSessionActive] = useState(false);
  const [showPostSession, setShowPostSession] = useState(false);
  const [conceptsTouched, setConceptsTouched] = useState([]);
  const [sessionId] = useState(() => Date.now());

  const domain = DOMAINS.find(d => d.id === selectedDomainId);

  function handleStartSession() {
    // Mark all domain concepts as at least ENCOUNTER if UNSEEN
    const updates = {};
    domain.conceptIds.forEach(id => {
      if ((state.concepts[id]?.stage || 'UNSEEN') === 'UNSEEN') {
        updates[id] = 'ENCOUNTER';
      }
    });
    if (Object.keys(updates).length > 0) {
      dispatch({ type: 'UPDATE_CONCEPTS_BATCH', updates });
    }

    setConceptsTouched(domain.conceptIds);
    setSessionActive(true);
  }

  function handleEndSession() {
    setSessionActive(false);
    setShowPostSession(true);
  }

  function handleCommand(cmd, ...args) {
    if (cmd === 'status') {
      const lines = domain.conceptIds.map(id => {
        const stage = state.concepts[id]?.stage || 'UNSEEN';
        return `${id}  ${STAGES[stage].symbol} ${stage}  ${CONCEPTS[id]?.description || ''}`;
      });
      return lines.join('\n');
    }
    if (cmd === 'advance') {
      const [conceptId, stage] = args;
      const validStages = ['UNSEEN', 'ENCOUNTER', 'TENSION', 'PATTERN', 'INTEGRATION'];
      if (!validStages.includes(stage)) {
        return `Invalid stage: ${stage}. Valid stages: ${validStages.join(', ')}`;
      }
      if (!CONCEPTS[conceptId]) {
        return `Unknown concept: ${conceptId}`;
      }
      dispatch({ type: 'UPDATE_CONCEPT_STAGE', conceptId, stage });
      if (!conceptsTouched.includes(conceptId)) {
        setConceptsTouched(prev => [...prev, conceptId]);
      }
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
        type: 'domain_study',
        domain_id: selectedDomainId,
        concepts_touched: conceptsTouched,
      },
    });
    setShowPostSession(false);
    navigate('dashboard');
  }

  // Picker view
  if (!sessionActive && !showPostSession) {
    return (
      <div className="view" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
        <DomainPicker
          domains={DOMAINS}
          concepts={state.concepts}
          selectedId={selectedDomainId}
          onSelect={setSelectedDomainId}
        />

        {selectedDomainId && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-panel)', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                  Selected: Domain {domain?.id}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {domain?.name}
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleStartSession}>
                Begin Session →
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="view" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Session header */}
        <div className="session-header">
          <div className="session-header-left">
            <span className="session-header-type">DOMAIN {domain?.id}</span>
            <span className="session-header-title">{domain?.name}</span>
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
              systemPrompt={domain ? getStudyPrompt(domain) : ''}
              initialMessage={`Begin a domain study session for "${domain?.name}". Present an opening scenario that creates an encounter with one of the core concepts in this domain.`}
              onCommand={handleCommand}
              conceptsTouched={conceptsTouched}
              sessionActive={sessionActive}
              onEndSession={handleEndSession}
            />
          </div>

          {domain && (
            <SessionSidebar
              domain={domain}
              concepts={state.concepts}
              conceptsTouched={conceptsTouched}
            />
          )}
        </div>
      </div>

      {showPostSession && (
        <PostSessionReview
          conceptIds={conceptsTouched}
          currentConcepts={state.concepts}
          onSave={handlePostSessionSave}
          onDismiss={() => {
            setShowPostSession(false);
            navigate('dashboard');
          }}
        />
      )}
    </>
  );
}
