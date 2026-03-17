import { useState } from 'react';
import { CONCEPTS, STAGES, STAGE_ORDER } from '../data/knowledge.js';

export function PostSessionReview({ conceptIds, currentConcepts, onSave, onDismiss }) {
  const [updates, setUpdates] = useState(() => {
    const init = {};
    conceptIds.forEach(id => {
      init[id] = currentConcepts[id]?.stage || 'UNSEEN';
    });
    return init;
  });

  function handleChange(id, stage) {
    setUpdates(prev => ({ ...prev, [id]: stage }));
  }

  function handleSave() {
    onSave(updates);
  }

  const hasChanges = conceptIds.some(id => updates[id] !== (currentConcepts[id]?.stage || 'UNSEEN'));

  return (
    <div className="overlay">
      <div className="overlay-panel" style={{ width: 'min(560px, 90vw)' }}>
        <div className="overlay-header">
          <div className="overlay-title">SESSION COMPLETE — UPDATE FORMATION STAGES</div>
          <div className="overlay-subtitle">
            Honestly assess where each concept landed in this session.
          </div>
        </div>
        <div className="overlay-body">
          {conceptIds.length === 0 ? (
            <div className="empty-state">No concepts were marked as touched in this session.</div>
          ) : (
            <div>
              {/* Stage legend */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px', padding: '10px', background: 'var(--bg-panel-alt)', borderRadius: 'var(--radius-md)' }}>
                {STAGE_ORDER.map(s => (
                  <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: STAGES[s].color }}>
                    {STAGES[s].symbol} {STAGES[s].label}
                  </span>
                ))}
              </div>

              {conceptIds.map(id => {
                const concept = CONCEPTS[id];
                const currentStage = currentConcepts[id]?.stage || 'UNSEEN';
                const selectedStage = updates[id];
                const changed = selectedStage !== currentStage;

                return (
                  <div key={id} className="stage-update-row">
                    <span className="stage-update-id">{id}</span>
                    <span className="stage-update-desc" title={concept?.description}>
                      {concept?.description || id}
                    </span>
                    <select
                      className="stage-select"
                      value={selectedStage}
                      onChange={e => handleChange(id, e.target.value)}
                      style={{
                        borderColor: changed ? 'var(--accent-gold)' : undefined,
                        color: STAGES[selectedStage]?.color,
                      }}
                    >
                      {STAGE_ORDER.map(s => (
                        <option key={s} value={s} style={{ color: STAGES[s].color }}>
                          {STAGES[s].symbol} {s}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="overlay-footer">
          <button className="btn btn-secondary" onClick={onDismiss}>
            Skip
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            {hasChanges ? 'Save updates' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
}
