import { CURRICULUM_MODULES, CURRICULUM_PHASES, CONCEPTS, STAGES, DOMAINS } from '../data/knowledge.js';

function getModuleProgress(module, concepts) {
  const stages = module.conceptIds.map(id => concepts[id]?.stage || 'UNSEEN');
  const counts = { UNSEEN: 0, ENCOUNTER: 0, TENSION: 0, PATTERN: 0, INTEGRATION: 0 };
  stages.forEach(s => counts[s]++);
  const total = module.conceptIds.length;
  const started = total - counts.UNSEEN;
  const integrated = counts.PATTERN + counts.INTEGRATION;
  return { counts, total, started, integrated };
}

function isModuleUnlocked(module, concepts) {
  if (module.prerequisiteIds.length === 0) return true;
  return module.prerequisiteIds.every(prereqId => {
    const prereq = CURRICULUM_MODULES.find(m => m.id === prereqId);
    if (!prereq) return true;
    const progress = getModuleProgress(prereq, concepts);
    return progress.started >= Math.ceil(prereq.conceptIds.length / 2);
  });
}

function getModuleStatus(module, concepts) {
  const progress = getModuleProgress(module, concepts);
  const unlocked = isModuleUnlocked(module, concepts);
  if (!unlocked) return 'locked';
  if (progress.integrated === progress.total) return 'complete';
  if (progress.started > 0) return 'active';
  return 'ready';
}

const STATUS_STYLES = {
  locked:   { border: 'var(--border)',        accent: 'var(--text-muted)',   bg: 'var(--bg-panel)' },
  ready:    { border: 'var(--border)',        accent: 'var(--text-secondary)', bg: 'var(--bg-panel)' },
  active:   { border: 'var(--accent-gold)',   accent: 'var(--accent-gold)',  bg: 'var(--accent-gold-dim)' },
  complete: { border: 'var(--accent-teal)',   accent: 'var(--accent-teal)',  bg: 'var(--accent-teal-dim)' },
};

const STATUS_LABELS = {
  locked:   '⊘  Locked',
  ready:    '○  Ready to start',
  active:   '◑  In progress',
  complete: '●  Complete',
};

function ModuleCard({ module, concepts, onStudy, onLearn }) {
  const progress = getModuleProgress(module, concepts);
  const status = getModuleStatus(module, concepts);
  const style = STATUS_STYLES[status];
  const isLocked = status === 'locked';

  const domainNames = module.domainIds.map(id => DOMAINS.find(d => d.id === id)?.name.split('&')[0].trim()).filter(Boolean);

  return (
    <div style={{
      background: style.bg,
      border: `1px solid ${style.border}`,
      borderRadius: 'var(--radius-md)',
      padding: '18px 20px',
      opacity: isLocked ? 0.55 : 1,
      transition: 'all var(--transition)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '10px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: style.accent, fontWeight: 600 }}>
              {module.id}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', padding: '1px 5px', background: 'var(--bg-panel-alt)', borderRadius: '2px' }}>
              {module.phaseLabel}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>
              ~{module.estimatedMinutes}min
            </span>
          </div>
          <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>
            {module.title}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {module.subtitle}
          </div>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: style.accent, textAlign: 'right', flexShrink: 0 }}>
          <div>{STATUS_LABELS[status]}</div>
          <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>{progress.started}/{progress.total} concepts started</div>
        </div>
      </div>

      {/* Why this module */}
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.55', marginBottom: '12px', padding: '10px 12px', background: 'var(--bg-base)', borderRadius: 'var(--radius-sm)', borderLeft: `2px solid ${style.border}` }}>
        {module.why}
      </div>

      {/* Concept stage summary */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {module.conceptIds.map(id => {
          const stage = concepts[id]?.stage || 'UNSEEN';
          const s = STAGES[stage];
          return (
            <span key={id} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: s.color, display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                  title={CONCEPTS[id]?.description}>
              {s.symbol} {id}
            </span>
          );
        })}
      </div>

      {/* Domain tags + doc links */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
        {domainNames.map(name => (
          <span key={name} className="tag domain">{name}</span>
        ))}
        {module.docsLinks.map(link => (
          <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
             style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--accent-blue)', textDecoration: 'none', padding: '2px 6px', background: 'var(--accent-blue-dim)', borderRadius: '2px' }}
             title={link.url}>
            ↗ {link.label}
          </a>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ height: '3px', background: 'var(--bg-base)', borderRadius: '2px', overflow: 'hidden', marginBottom: '14px' }}>
        <div style={{
          height: '100%',
          width: `${progress.total > 0 ? (progress.integrated / progress.total) * 100 : 0}%`,
          background: style.accent,
          borderRadius: '2px',
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Actions */}
      {!isLocked && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => onLearn(module)} style={{ fontSize: '11px' }}>
            Read references
          </button>
          <button className="btn btn-primary" onClick={() => onStudy(module)} style={{ fontSize: '11px' }}>
            {status === 'complete' ? 'Review module' : status === 'active' ? 'Continue studying' : 'Start module'} →
          </button>
        </div>
      )}
      {isLocked && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
          Complete prerequisites first: {module.prerequisiteIds.join(', ')}
        </div>
      )}
    </div>
  );
}

function PhaseSection({ phase, modules, concepts, onStudy, onLearn }) {
  const phaseModules = modules.filter(m => m.phase === phase.id);
  const allComplete = phaseModules.every(m => getModuleStatus(m, concepts) === 'complete');
  const anyActive = phaseModules.some(m => getModuleStatus(m, concepts) === 'active');

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: allComplete ? 'var(--accent-green)' : anyActive ? 'var(--accent-gold)' : 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Phase {phase.id} — {phase.label}
            </span>
            {allComplete && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--accent-green)', padding: '1px 5px', background: 'var(--accent-green-dim)', borderRadius: '2px' }}>COMPLETE</span>}
            {anyActive && !allComplete && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--accent-gold)', padding: '1px 5px', background: 'var(--accent-gold-dim)', borderRadius: '2px' }}>ACTIVE</span>}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{phase.description}</div>
        </div>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {phaseModules.map(m => (
          <ModuleCard key={m.id} module={m} concepts={concepts} onStudy={onStudy} onLearn={onLearn} />
        ))}
      </div>
    </div>
  );
}

export function Curriculum({ state, navigate }) {
  const { concepts } = state;

  // Find the recommended next module
  const nextModule = CURRICULUM_MODULES.find(m => {
    const status = getModuleStatus(m, concepts);
    return status === 'active' || status === 'ready';
  });

  // Overall progress
  const allConceptIds = CURRICULUM_MODULES.flatMap(m => m.conceptIds);
  const uniqueIds = [...new Set(allConceptIds)];
  const startedCount = uniqueIds.filter(id => (concepts[id]?.stage || 'UNSEEN') !== 'UNSEEN').length;
  const integratedCount = uniqueIds.filter(id => ['PATTERN', 'INTEGRATION'].includes(concepts[id]?.stage)).length;
  const estimatedTotal = CURRICULUM_MODULES.reduce((sum, m) => sum + m.estimatedMinutes, 0);

  function handleStudy(module) {
    // Go to study domain for the first domain in the module
    navigate('study', { highlightDomain: module.domainIds[0] });
  }

  function handleLearn(module) {
    // Go to learn center with the first domain
    navigate('learn', { highlightDomain: module.domainIds[0] });
  }

  return (
    <div className="view" style={{ padding: 0 }}>
      <div className="view-header">
        <span className="view-title"><span>CURRICULUM</span> PATH</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
          Recommended study sequence · {estimatedTotal / 60 | 0}h {estimatedTotal % 60}m estimated
        </span>
      </div>

      <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1 }}>
        {/* Progress overview */}
        <div className="stats-row" style={{ marginBottom: '24px' }}>
          <div className="stat-cell">
            <div className="stat-value gold">{startedCount}</div>
            <div className="stat-label">Concepts started</div>
          </div>
          <div className="stat-cell">
            <div className="stat-value green">{integratedCount}</div>
            <div className="stat-label">Integrated</div>
          </div>
          <div className="stat-cell">
            <div className="stat-value" style={{ color: 'var(--text-primary)' }}>{CURRICULUM_MODULES.length}</div>
            <div className="stat-label">Modules total</div>
          </div>
          <div className="stat-cell">
            <div className="stat-value" style={{ color: 'var(--text-primary)' }}>{CURRICULUM_MODULES.filter(m => getModuleStatus(m, concepts) === 'complete').length}</div>
            <div className="stat-label">Modules complete</div>
          </div>
        </div>

        {/* Recommended next */}
        {nextModule && (
          <div style={{ marginBottom: '28px', padding: '14px 18px', background: 'var(--accent-gold-dim)', border: '1px solid var(--accent-gold)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--accent-gold)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '3px' }}>
                Recommended next
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                {nextModule.id}: {nextModule.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {nextModule.subtitle}
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => handleStudy(nextModule)}>
              Continue →
            </button>
          </div>
        )}

        {/* Phase sections */}
        {CURRICULUM_PHASES.map(phase => (
          <PhaseSection
            key={phase.id}
            phase={phase}
            modules={CURRICULUM_MODULES}
            concepts={concepts}
            onStudy={handleStudy}
            onLearn={handleLearn}
          />
        ))}
      </div>
    </div>
  );
}
