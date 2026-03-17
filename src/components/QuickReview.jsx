import { useState, useEffect, useRef, useCallback } from 'react';
import { CONCEPTS, STAGES } from '../data/knowledge.js';
import { getDueConcepts, updateSM2, QUALITY_DESCRIPTIONS, formatNextReview } from '../lib/sm2.js';
import { getReviewPrompt } from '../lib/prompts.js';
import { callClaude, compactMessages } from '../lib/api.js';

function ConceptReviewChat({ concept, conceptDesc, systemPrompt, onDone }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);
  const conversationRef = useRef([]);
  const scrollRef = useRef(null);

  function scrollToBottom() {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }

  // Auto-start on mount
  useEffect(() => {
    if (!started) {
      setStarted(true);
      startReview();
    }
  }, []);

  async function startReview() {
    const openMsg = { role: 'user', content: 'Begin the review. Present a scenario.' };
    conversationRef.current = [openMsg];
    setThinking(true);
    try {
      const response = await callClaude({ systemPrompt, messages: conversationRef.current, maxTokens: 512 });
      conversationRef.current.push({ role: 'assistant', content: response });
      setMessages([{ role: 'assistant', content: response, ts: Date.now() }]);
    } catch (e) {
      setError(e.message);
    } finally {
      setThinking(false);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || thinking) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text, ts: Date.now() }]);
    conversationRef.current.push({ role: 'user', content: text });
    conversationRef.current = compactMessages(conversationRef.current);

    setThinking(true);
    setError('');
    try {
      const response = await callClaude({ systemPrompt, messages: conversationRef.current, maxTokens: 512 });
      conversationRef.current.push({ role: 'assistant', content: response });
      setMessages(prev => [...prev, { role: 'assistant', content: response, ts: Date.now() }]);
      setTimeout(scrollToBottom, 50);
    } catch (e) {
      setError(e.message);
      conversationRef.current.pop();
    } finally {
      setThinking(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto' }}>
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`} style={{ borderLeft: m.role === 'assistant' ? '2px solid var(--accent-blue)' : '2px solid var(--border-strong)', background: m.role === 'assistant' ? 'linear-gradient(to right, var(--accent-blue-dim) 0%, transparent 60%)' : undefined }}>
            <div className="message-header">
              <span className={`message-role ${m.role}`}>{m.role === 'assistant' ? 'CLAUDE' : 'YOU'}</span>
            </div>
            <div className={`message-body ${m.role}`}>{m.content}</div>
          </div>
        ))}
        {thinking && (
          <div className="thinking-indicator">
            <div className="thinking-pulse" />
          </div>
        )}
        {error && <div className="error-bar" style={{ margin: '12px 24px' }}>{error}</div>}
      </div>

      <div className="input-bar">
        <div className="input-row">
          <textarea
            className="input-field"
            placeholder="Your response..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={thinking}
            rows={1}
          />
          <button className="btn btn-send" onClick={handleSend} disabled={!input.trim() || thinking}>↑</button>
        </div>
      </div>

      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
        <button className="btn btn-secondary" onClick={onDone} style={{ width: '100%', justifyContent: 'center' }}>
          Done with this concept →
        </button>
      </div>
    </div>
  );
}

function QualityRating({ onRate }) {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
        How well did you recall this concept?
      </div>
      <div className="quality-grid">
        {QUALITY_DESCRIPTIONS.map(({ q, label, desc }) => (
          <div
            key={q}
            className={`quality-btn${selected === q ? ' selected' : ''}`}
            onClick={() => setSelected(q)}
          >
            <div className="quality-num">{q}</div>
            <div className="quality-desc">{label}</div>
          </div>
        ))}
      </div>
      {selected !== null && (
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={() => onRate(selected)}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export function QuickReview({ state, dispatch, navigate }) {
  const dueConcepts = getDueConcepts(state.concepts);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState('chat'); // 'chat' | 'rate'
  const [results, setResults] = useState([]); // [{conceptId, quality}]
  const [done, setDone] = useState(false);

  if (dueConcepts.length === 0) {
    const nextDue = Object.values(state.concepts)
      .filter(c => c.next_review && (c.stage === 'PATTERN' || c.stage === 'INTEGRATION'))
      .sort((a, b) => new Date(a.next_review) - new Date(b.next_review))[0];

    return (
      <div className="view" style={{ padding: '20px 24px' }}>
        <div className="view-header" style={{ padding: '0 0 20px', border: 'none' }}>
          <span className="view-title"><span>QUICK</span> REVIEW</span>
        </div>

        <div style={{ maxWidth: '480px' }}>
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', color: 'var(--accent-teal)', marginBottom: '8px' }}>0</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Concepts due for review
            </div>
            {nextDue ? (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                Next review: <span style={{ color: 'var(--accent-gold)' }}>{formatNextReview(nextDue.next_review)}</span>
                {' '}— {nextDue.id}
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Study domain concepts and advance them to PATTERN or INTEGRATION to add them to the review queue.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="view" style={{ padding: '20px 24px' }}>
        <div className="view-header" style={{ padding: '0 0 20px', border: 'none' }}>
          <span className="view-title"><span>REVIEW</span> COMPLETE</span>
        </div>
        <div style={{ maxWidth: '480px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Reviewed {results.length} concept{results.length !== 1 ? 's' : ''}
          </div>
          {results.map(({ conceptId, quality }) => {
            const c = state.concepts[conceptId];
            const q = QUALITY_DESCRIPTIONS.find(d => d.q === quality);
            return (
              <div key={conceptId} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-gold)', width: '28px' }}>{conceptId}</span>
                <span style={{ flex: 1, fontSize: '12px', color: 'var(--text-secondary)' }}>{CONCEPTS[conceptId]?.description}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: quality >= 3 ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
                  {quality} — {q?.label}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                  {formatNextReview(c?.next_review)}
                </span>
              </div>
            );
          })}
          <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={() => navigate('dashboard')}>
              Dashboard
            </button>
            <button className="btn btn-primary" onClick={() => {
              setCurrentIdx(0);
              setPhase('chat');
              setResults([]);
              setDone(false);
            }}>
              Review again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const concept = dueConcepts[currentIdx];
  if (!concept) {
    setDone(true);
    return null;
  }

  const conceptData = CONCEPTS[concept.id];
  const systemPrompt = getReviewPrompt(concept, conceptData?.description || concept.id);

  function handleConceptDone() {
    setPhase('rate');
  }

  function handleRate(quality) {
    // Update SM-2
    const updated = updateSM2(concept, quality);
    dispatch({ type: 'UPDATE_CONCEPT_SM2', conceptId: concept.id, concept: updated });

    setResults(prev => [...prev, { conceptId: concept.id, quality }]);

    if (currentIdx + 1 >= dueConcepts.length) {
      // Save session
      dispatch({
        type: 'ADD_SESSION',
        session: {
          id: Date.now(),
          started_at: new Date().toISOString(),
          ended_at: new Date().toISOString(),
          type: 'review',
          concepts_touched: dueConcepts.map(c => c.id),
        },
      });
      setDone(true);
    } else {
      setCurrentIdx(prev => prev + 1);
      setPhase('chat');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div className="session-header">
        <div className="session-header-left">
          <span className="session-header-type" style={{ color: 'var(--accent-teal)', background: 'var(--accent-teal-dim)' }}>
            REVIEW
          </span>
          <span className="session-header-title">
            {currentIdx + 1} / {dueConcepts.length} — {concept.id}
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
          {STAGES[concept.stage]?.symbol} {concept.stage}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: '3px', background: 'var(--bg-panel)', flexShrink: 0 }}>
        <div
          style={{
            height: '100%',
            background: 'var(--accent-gold)',
            width: `${(currentIdx / dueConcepts.length) * 100}%`,
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Content */}
      {phase === 'chat' ? (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ConceptReviewChat
            concept={concept}
            conceptDesc={conceptData?.description || concept.id}
            systemPrompt={systemPrompt}
            onDone={handleConceptDone}
          />
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <QualityRating onRate={handleRate} />
        </div>
      )}
    </div>
  );
}
