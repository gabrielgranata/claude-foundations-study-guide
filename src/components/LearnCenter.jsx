import { useState } from 'react';
import { DOMAINS, CONCEPTS, STAGES } from '../data/knowledge.js';
import { getReferencePrompt, getExamIntelPrompt } from '../lib/prompts.js';
import { callClaude } from '../lib/api.js';

// ── Lightweight markdown renderer (no dep) ────────────────
function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-gold)', marginTop: '20px', marginBottom: '8px' }}>
          {line.slice(3)}
        </h3>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h4 key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600, color: 'var(--accent-blue)', marginTop: '12px', marginBottom: '6px' }}>
          {line.slice(4)}
        </h4>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      // Collect list items
      const items = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        const content = lines[i].slice(2);
        items.push(<li key={i}>{inlineFormat(content)}</li>);
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ paddingLeft: '16px', margin: '6px 0', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {items}
        </ul>
      );
      continue;
    } else if (line.trim() === '') {
      // skip blank lines
    } else {
      elements.push(
        <p key={i} style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-primary)', margin: '4px 0' }}>
          {inlineFormat(line)}
        </p>
      );
    }
    i++;
  }

  return elements;
}

function inlineFormat(text) {
  // Handle backtick code and ** bold
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const codeIdx = remaining.indexOf('`');
    const boldIdx = remaining.indexOf('**');
    const linkMatch = remaining.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);

    const candidates = [
      codeIdx >= 0 ? { type: 'code', idx: codeIdx } : null,
      boldIdx >= 0 ? { type: 'bold', idx: boldIdx } : null,
      linkMatch ? { type: 'link', idx: linkMatch.index } : null,
    ].filter(Boolean).sort((a, b) => a.idx - b.idx);

    if (candidates.length === 0) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    const first = candidates[0];
    if (first.idx > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, first.idx)}</span>);
      remaining = remaining.slice(first.idx);
    }

    if (first.type === 'code') {
      const end = remaining.indexOf('`', 1);
      if (end === -1) { parts.push(<span key={key++}>{remaining}</span>); break; }
      parts.push(<code key={key++} style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', background: 'var(--bg-panel-alt)', padding: '1px 5px', borderRadius: '2px', color: 'var(--accent-cyan)' }}>{remaining.slice(1, end)}</code>);
      remaining = remaining.slice(end + 1);
    } else if (first.type === 'bold') {
      const end = remaining.indexOf('**', 2);
      if (end === -1) { parts.push(<span key={key++}>{remaining}</span>); break; }
      parts.push(<strong key={key++} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{remaining.slice(2, end)}</strong>);
      remaining = remaining.slice(end + 2);
    } else if (first.type === 'link') {
      const m = remaining.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
      parts.push(
        <a key={key++} href={m[2]} target="_blank" rel="noopener noreferrer"
           style={{ color: 'var(--accent-blue)', textDecoration: 'underline', textDecorationColor: 'rgba(90,140,200,0.4)', textUnderlineOffset: '2px' }}>
          {m[1]}
        </a>
      );
      remaining = remaining.slice(m[0].length);
    }
  }

  return parts;
}

// ── Concept reference card ────────────────────────────────
function ConceptReferenceCard({ conceptId, domainName, cachedRef, apiKey, onCache, onRequestApiKey, onStudy }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const concept = CONCEPTS[conceptId];

  async function handleGenerate() {
    if (!apiKey) { onRequestApiKey(); return; }
    setLoading(true);
    setError('');
    try {
      const systemPrompt = getReferencePrompt(conceptId, concept.description, domainName);
      const response = await callClaude({
        apiKey,
        systemPrompt,
        messages: [{ role: 'user', content: 'Generate the reference.' }],
        maxTokens: 800,
      });
      onCache(conceptId, response);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const stage = cachedRef ? null : null; // just for rendering

  return (
    <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      {/* Card header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-gold)', flexShrink: 0 }}>{conceptId}</span>
          <span style={{ fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {concept?.description}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          {onStudy && (
            <button className="btn btn-secondary" onClick={() => onStudy(conceptId)} style={{ height: '26px', fontSize: '10px' }}>
              Study →
            </button>
          )}
          {!cachedRef ? (
            <button className="btn btn-primary" onClick={handleGenerate} disabled={loading} style={{ height: '26px', fontSize: '10px' }}>
              {loading ? '···' : 'Generate Reference'}
            </button>
          ) : (
            <button className="btn btn-ghost" onClick={handleGenerate} disabled={loading} style={{ height: '26px', fontSize: '10px', color: 'var(--text-muted)' }}>
              {loading ? '···' : '↺ Refresh'}
            </button>
          )}
        </div>
      </div>

      {/* Reference content */}
      {cachedRef && (
        <div style={{ padding: '16px 18px', maxHeight: '500px', overflowY: 'auto' }}>
          {renderMarkdown(cachedRef.content)}
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>
            Generated {new Date(cachedRef.generatedAt).toLocaleDateString()}
          </div>
        </div>
      )}

      {error && (
        <div style={{ padding: '10px 16px', color: 'var(--accent-orange)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{error}</div>
      )}

      {loading && (
        <div style={{ padding: '20px 18px' }}>
          <div style={{ height: '2px', background: 'linear-gradient(to right, var(--accent-gold), transparent)', borderRadius: '1px', animation: 'pulse 1.4s ease-in-out infinite', width: '80px' }} />
        </div>
      )}
    </div>
  );
}

// ── Exam intel panel ──────────────────────────────────────
function ExamIntelPanel({ examIntel, apiKey, onSet, onRequestApiKey }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGenerate() {
    if (!apiKey) { onRequestApiKey(); return; }
    setLoading(true);
    setError('');
    try {
      const systemPrompt = getExamIntelPrompt();
      const response = await callClaude({
        apiKey,
        systemPrompt,
        messages: [{ role: 'user', content: 'Generate the exam prep briefing.' }],
        maxTokens: 1200,
      });
      onSet(response);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Exam Intelligence
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
            Claude's synthesis of CCA Foundations exam preparation — format, high-yield areas, failure modes.
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
          {loading ? '···' : examIntel ? '↺ Refresh' : 'Generate Briefing'}
        </button>
      </div>

      {error && <div className="error-bar">{error}</div>}

      {loading && (
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ height: '2px', background: 'linear-gradient(to right, var(--accent-gold), transparent)', borderRadius: '1px', animation: 'pulse 1.4s ease-in-out infinite', width: '120px', margin: '0 auto' }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px' }}>Synthesizing exam intelligence...</div>
        </div>
      )}

      {examIntel && !loading && (
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px 22px' }}>
          {renderMarkdown(examIntel.content)}
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>
            Generated {new Date(examIntel.generatedAt).toLocaleDateString()} · Based on Claude's training knowledge — verify against official Anthropic documentation
          </div>
        </div>
      )}

      {!examIntel && !loading && (
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '32px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            No briefing generated yet.
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Generate a briefing to see: exam format, highest-yield topics, common failure modes, and an 80/20 study plan.
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main LearnCenter view ─────────────────────────────────
export function LearnCenter({ state, dispatch, navigate, onRequestApiKey }) {
  const [tab, setTab] = useState('concepts'); // 'concepts' | 'intel'
  const [selectedDomainId, setSelectedDomainId] = useState(1);
  const [expandedConcepts, setExpandedConcepts] = useState(new Set());

  const domain = DOMAINS.find(d => d.id === selectedDomainId);

  function toggleConcept(id) {
    setExpandedConcepts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleCache(conceptId, content) {
    dispatch({ type: 'CACHE_REFERENCE', conceptId, content });
  }

  function handleSetIntel(content) {
    dispatch({ type: 'SET_EXAM_INTEL', content });
  }

  function handleStudy(conceptId) {
    const concept = CONCEPTS[conceptId];
    if (concept) {
      navigate('study', { highlightDomain: concept.domainId });
    }
  }

  const TABS = [
    { id: 'concepts', label: 'Concept Library' },
    { id: 'intel', label: 'Exam Intel' },
  ];

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Domain nav */}
      <div style={{ width: '200px', flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--bg-panel)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Domains
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
          {DOMAINS.map(d => {
            const conceptCount = d.conceptIds.length;
            const withRef = d.conceptIds.filter(id => state.referenceCache[id]).length;
            return (
              <div
                key={d.id}
                onClick={() => setSelectedDomainId(d.id)}
                style={{
                  padding: '9px 16px',
                  cursor: 'pointer',
                  borderLeft: `2px solid ${selectedDomainId === d.id ? 'var(--accent-gold)' : 'transparent'}`,
                  background: selectedDomainId === d.id ? 'var(--accent-gold-dim)' : undefined,
                  transition: 'all var(--transition)',
                }}
                onMouseEnter={e => { if (selectedDomainId !== d.id) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={e => { if (selectedDomainId !== d.id) e.currentTarget.style.background = ''; }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: selectedDomainId === d.id ? 'var(--accent-gold)' : 'var(--text-muted)', marginBottom: '2px' }}>
                  D{d.id} · {d.weight}%
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                  {d.name}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {withRef}/{conceptCount} referenced
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Tab bar */}
        <div style={{ padding: '0 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)', display: 'flex', alignItems: 'center', gap: '0', flexShrink: 0 }}>
          {TABS.map(t => (
            <div
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '12px 18px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.08em',
                color: tab === t.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
                borderBottom: tab === t.id ? '2px solid var(--accent-gold)' : '2px solid transparent',
                marginBottom: '-1px',
                transition: 'color var(--transition)',
              }}
            >
              {t.label}
            </div>
          ))}

          <div style={{ flex: 1 }} />

          {tab === 'concepts' && domain && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                className="btn btn-secondary"
                style={{ height: '28px', fontSize: '10px' }}
                onClick={() => {
                  // Generate all missing references for this domain
                  const missing = domain.conceptIds.filter(id => !state.referenceCache[id]);
                  if (missing.length > 0) setExpandedConcepts(new Set(missing));
                }}
              >
                Expand all
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {tab === 'concepts' && domain && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-gold)', marginBottom: '4px' }}>
                  DOMAIN {domain.id} · {domain.weight}% of exam
                </div>
                <div style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {domain.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {domain.conceptIds.length} concepts · Click "Generate Reference" to create a study note for each concept, or click the concept row to expand/collapse.
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {domain.conceptIds.map(id => {
                  const cached = state.referenceCache[id];
                  const stage = state.concepts[id]?.stage || 'UNSEEN';
                  const s = STAGES[stage];
                  const isExpanded = expandedConcepts.has(id);

                  return (
                    <div key={id}>
                      {/* Collapsed row */}
                      {!isExpanded ? (
                        <div
                          onClick={() => toggleConcept(id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'border-color var(--transition)' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: s.color, width: '16px', textAlign: 'center' }}>{s.symbol}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', width: '28px' }}>{id}</span>
                          <span style={{ flex: 1, fontSize: '13px', color: 'var(--text-secondary)' }}>{CONCEPTS[id]?.description}</span>
                          {cached && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--accent-teal)', padding: '2px 6px', background: 'var(--accent-teal-dim)', borderRadius: '2px' }}>
                              REFERENCED
                            </span>
                          )}
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>›</span>
                        </div>
                      ) : (
                        <div>
                          {/* Expanded — show full card */}
                          <div
                            onClick={() => toggleConcept(id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'var(--bg-panel-alt)', border: '1px solid var(--accent-gold)', borderBottom: 'none', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', cursor: 'pointer' }}
                          >
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: s.color, width: '16px', textAlign: 'center' }}>{s.symbol}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-gold)', width: '28px' }}>{id}</span>
                            <span style={{ flex: 1, fontSize: '13px', color: 'var(--text-primary)' }}>{CONCEPTS[id]?.description}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>‹</span>
                          </div>
                          <div style={{ border: '1px solid var(--accent-gold)', borderTop: 'none', borderRadius: '0 0 var(--radius-md) var(--radius-md)', overflow: 'hidden' }}>
                            <ConceptReferenceCard
                              conceptId={id}
                              domainName={domain.name}
                              cachedRef={cached}
                              apiKey={state.apiKey}
                              onCache={handleCache}
                              onRequestApiKey={onRequestApiKey}
                              onStudy={handleStudy}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'intel' && (
            <ExamIntelPanel
              examIntel={state.examIntel}
              apiKey={state.apiKey}
              onSet={handleSetIntel}
              onRequestApiKey={onRequestApiKey}
            />
          )}
        </div>
      </div>
    </div>
  );
}
