import { useState, useEffect, useRef } from 'react';
import { ANTI_PATTERNS, CONCEPTS, STAGES } from '../data/knowledge.js';
import { getAntiPatternPrompt } from '../lib/prompts.js';
import { ConversationInterface } from './ConversationInterface.jsx';
import { PostSessionReview } from './PostSessionReview.jsx';

import { loadExtraState, saveExtraState } from '../lib/storage.js';

// Simple syntax highlighting for Python/text without Prism dependency issues
function CodeHighlight({ code, language }) {
  if (language !== 'python') {
    return (
      <pre className="snippet-code" style={{ color: 'var(--text-secondary)' }}>
        <code>{code}</code>
      </pre>
    );
  }

  // Basic Python tokenizer
  function tokenize(line) {
    const keywords = /\b(def|class|if|else|elif|for|while|return|import|from|True|False|None|and|or|not|in|break|continue|try|except|with|as|raise|pass|lambda|yield|global|nonlocal|async|await)\b/g;
    const strings = /("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')/g;
    const comments = /(#.*)/g;
    const numbers = /\b(\d+\.?\d*)\b/g;
    const builtins = /\b(print|len|range|list|dict|set|tuple|str|int|float|bool|type|isinstance|hasattr|getattr|setattr|open|sum|max|min|zip|map|filter|enumerate)\b/g;

    // Escape HTML
    let escaped = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Apply highlighting (order matters)
    escaped = escaped
      .replace(comments, '<span style="color:#6a6a7a">$1</span>')
      .replace(strings, '<span style="color:#9ecf7c">$1</span>')
      .replace(keywords, '<span style="color:#5A8CC8;font-weight:500">$1</span>')
      .replace(builtins, '<span style="color:#5AC8D8">$1</span>')
      .replace(numbers, '<span style="color:#c3a0e8">$1</span>');

    return escaped;
  }

  const lines = code.split('\n').map((line, i) => (
    <div key={i} dangerouslySetInnerHTML={{ __html: tokenize(line) || '&nbsp;' }} />
  ));

  return (
    <pre className="snippet-code">
      <code>{lines}</code>
    </pre>
  );
}

function APPicker({ patterns, selectedId, onSelect }) {
  return (
    <div style={{ padding: '20px 24px', flex: 1, overflowY: 'auto' }}>
      <div className="view-header" style={{ padding: '0 0 16px', border: 'none' }}>
        <span className="view-title"><span>ANTI-PATTERN</span> DRILLS</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
          Identify what's wrong and why
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
        {patterns.map(ap => (
          <div
            key={ap.id}
            className={`ap-card${selectedId === ap.id ? ' selected' : ''}`}
            onClick={() => onSelect(ap.id)}
          >
            <div className="ap-card-id">{ap.id}</div>
            <div className="ap-card-name">{ap.name}</div>
            <div className="ap-card-meta">{ap.summary}</div>
            <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
              {ap.relatedConcepts.map(c => (
                <span key={c} className="tag concept">{c}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SnippetPanel({ ap }) {
  return (
    <div style={{ padding: '16px', flexShrink: 0 }}>
      <div className="snippet-panel">
        <div className="snippet-header">
          <span className="snippet-lang">{ap.language}</span>
          <span className="snippet-ap-id">{ap.id} · {ap.name}</span>
        </div>
        <CodeHighlight code={ap.snippet} language={ap.language} />
      </div>
    </div>
  );
}

function DrillSidebar({ ap, concepts }) {
  return (
    <div className="session-sidebar">
      <div className="session-sidebar-header">
        {ap.id} — Related Concepts
      </div>
      <div className="session-sidebar-scroll">
        <div className="concept-list">
          {ap.relatedConcepts.map(id => {
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

        <div className="divider" />

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          <div style={{ marginBottom: '6px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            The task
          </div>
          <div>Identify what's wrong in the snippet above. Then explain the mechanism — not just the label.</div>
        </div>
      </div>
    </div>
  );
}

export function AntiPatternDrills({ state, dispatch, navigate, params }) {
  const [selectedId, setSelectedId] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [showPostSession, setShowPostSession] = useState(false);
  const [sessionId] = useState(() => Date.now());

  const ap = ANTI_PATTERNS.find(p => p.id === selectedId);
  const chatKey = selectedId ? `chat_ap-${selectedId}` : null;
  const hasSavedSession = chatKey ? !!loadExtraState(chatKey, null) : false;

  function handleRandom() {
    const idx = Math.floor(Math.random() * ANTI_PATTERNS.length);
    setSelectedId(ANTI_PATTERNS[idx].id);
  }

  function handleStartDrill(resume = false) {
    if (!resume && chatKey) {
      saveExtraState(chatKey, null);
    }
    const updates = {};
    ap.relatedConcepts.forEach(id => {
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
      return ap.relatedConcepts.map(id => {
        const stage = state.concepts[id]?.stage || 'UNSEEN';
        return `${id}  ${STAGES[stage].symbol} ${stage}  ${CONCEPTS[id]?.description || ''}`;
      }).join('\n');
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
        type: 'antipattern',
        label: `${ap.id}: ${ap.name}`,
        concepts_touched: ap.relatedConcepts,
      },
    });
    setShowPostSession(false);
    navigate('dashboard');
  }

  if (!sessionActive && !showPostSession) {
    return (
      <div className="view" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
        <APPicker
          patterns={ANTI_PATTERNS}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        {selectedId !== null ? (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-panel)', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-orange)' }}>
                  {ap?.id}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {ap?.name}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary" onClick={handleRandom}>
                  Random
                </button>
                {hasSavedSession && (
                  <button className="btn btn-primary" onClick={() => handleStartDrill(true)}>
                    Resume →
                  </button>
                )}
                <button className={`btn ${hasSavedSession ? 'btn-secondary' : 'btn-primary'}`} onClick={() => handleStartDrill(false)}>
                  {hasSavedSession ? 'New Drill' : 'Begin Drill →'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-panel)', flexShrink: 0 }}>
            <button className="btn btn-secondary" onClick={handleRandom}>
              Random drill
            </button>
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
            <span className="session-header-type" style={{ color: 'var(--accent-orange)', background: 'var(--accent-orange-dim)', borderColor: 'rgba(217,119,86,0.2)' }}>
              {ap?.id}
            </span>
            <span className="session-header-title">{ap?.name}</span>
          </div>
          <div className="session-header-actions">
            <button className="btn btn-secondary" onClick={handleEndSession}>
              End Drill
            </button>
          </div>
        </div>

        <div className="session-layout" style={{ flex: 1, overflow: 'hidden' }}>
          <div className="session-main" style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Snippet — always visible */}
            {ap && <SnippetPanel ap={ap} />}

            {/* Conversation */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border)' }}>
              <ConversationInterface
                sessionKey={`ap-${selectedId}`}
                systemPrompt={ap ? getAntiPatternPrompt(ap) : ''}
                initialMessage={`The student has been shown the ${ap?.id} code snippet. Ask them what they see — what's wrong with this code?`}
                onCommand={handleCommand}
                sessionActive={sessionActive}
                onEndSession={handleEndSession}
              />
            </div>
          </div>

          {ap && <DrillSidebar ap={ap} concepts={state.concepts} />}
        </div>
      </div>

      {showPostSession && (
        <PostSessionReview
          conceptIds={ap?.relatedConcepts || []}
          currentConcepts={state.concepts}
          onSave={handlePostSessionSave}
          onDismiss={() => { setShowPostSession(false); navigate('dashboard'); }}
        />
      )}
    </>
  );
}
