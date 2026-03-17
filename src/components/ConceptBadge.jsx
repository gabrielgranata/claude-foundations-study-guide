import { STAGES, CONCEPTS } from '../data/knowledge.js';

export function ConceptBadge({ conceptId, showId = true, compact = false }) {
  const concept = CONCEPTS[conceptId];
  if (!concept) return null;
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
      {conceptId}
    </span>
  );
}

export function StageSymbol({ stage, size = 13 }) {
  const s = STAGES[stage] || STAGES.UNSEEN;
  return (
    <span
      style={{ color: s.color, fontFamily: 'var(--font-mono)', fontSize: `${size}px`, lineHeight: 1 }}
      title={s.label}
    >
      {s.symbol}
    </span>
  );
}

export function StageBadge({ stage }) {
  const s = STAGES[stage] || STAGES.UNSEEN;
  return (
    <span
      className="stage-badge"
      style={{
        color: s.color,
        background: s.bgColor,
        border: `1px solid ${s.color}22`,
      }}
    >
      <span style={{ fontFamily: 'var(--font-mono)' }}>{s.symbol}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.08em' }}>
        {s.label}
      </span>
    </span>
  );
}

export function ConceptRow({ conceptId, conceptState, onClick }) {
  const concept = CONCEPTS[conceptId];
  const stage = conceptState?.stage || 'UNSEEN';
  const s = STAGES[stage] || STAGES.UNSEEN;

  return (
    <div className={`concept-row${onClick ? '' : ''}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <span
        className="concept-stage-symbol"
        style={{ color: s.color }}
        title={s.label}
      >
        {s.symbol}
      </span>
      <span className="concept-id">{conceptId}</span>
      <span className={`concept-desc ${stage === 'TENSION' ? 'tension' : ''}`}>
        {concept?.description || conceptId}
      </span>
    </div>
  );
}
