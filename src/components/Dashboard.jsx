import { DOMAINS, CONCEPTS, STAGES, CURRICULUM_MODULES, STUDY_RESOURCES } from '../data/knowledge.js';
import { getDueConcepts, formatNextReview } from '../lib/sm2.js';
import { ConceptRow, StageSymbol } from './ConceptBadge.jsx';

function getModuleStatus(module, concepts) {
  const total = module.conceptIds.length;
  const started = module.conceptIds.filter(id => (concepts[id]?.stage || 'UNSEEN') !== 'UNSEEN').length;
  const integrated = module.conceptIds.filter(id => ['PATTERN', 'INTEGRATION'].includes(concepts[id]?.stage)).length;
  if (integrated === total) return 'complete';
  if (started > 0) return 'active';
  return 'ready';
}

// Welcome banner for brand-new users
function WelcomeBanner({ navigate }) {
  return (
    <div style={{ padding: '20px 24px', background: 'var(--accent-gold-dim)', borderBottom: '1px solid var(--accent-gold)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', maxWidth: '800px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-gold)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>
            Welcome to your study guide
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.55', marginBottom: '12px' }}>
            This tool builds genuine understanding of Claude architecture — not surface recall. The AI never gives you answers; it creates situations where you have to reason through them.
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--accent-gold)' }}>Start at Curriculum</span> to see the recommended study path.
              Then <span style={{ color: 'var(--accent-gold)' }}>Learn Center</span> to read references before each Socratic session.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button className="btn btn-secondary" onClick={() => navigate('learn')}>
            Learn Center
          </button>
          <button className="btn btn-primary" onClick={() => navigate('curriculum')}>
            View Curriculum →
          </button>
        </div>
      </div>
    </div>
  );
}

// "Continue" widget — shows what to do next
function NextStepWidget({ concepts, navigate }) {
  const nextModule = CURRICULUM_MODULES.find(m => {
    const status = getModuleStatus(m, concepts);
    return status === 'active';
  }) || CURRICULUM_MODULES.find(m => getModuleStatus(m, concepts) === 'ready');

  if (!nextModule) return null;

  const status = getModuleStatus(nextModule, concepts);
  const started = nextModule.conceptIds.filter(id => (concepts[id]?.stage || 'UNSEEN') !== 'UNSEEN').length;

  return (
    <div style={{ padding: '14px 18px', background: status === 'active' ? 'var(--accent-gold-dim)' : 'var(--bg-panel)', border: `1px solid ${status === 'active' ? 'var(--accent-gold)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: status === 'active' ? 'var(--accent-gold)' : 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>
          {status === 'active' ? 'Continue' : 'Up next'}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {nextModule.id}: {nextModule.title}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
          {started}/{nextModule.conceptIds.length} concepts started · {nextModule.estimatedMinutes}min
        </div>
      </div>
      <button className="btn btn-primary" style={{ flexShrink: 0 }} onClick={() => navigate('curriculum')}>
        {status === 'active' ? 'Continue →' : 'Start →'}
      </button>
    </div>
  );
}

const STAGE_ORDER = ['UNSEEN', 'ENCOUNTER', 'TENSION', 'PATTERN', 'INTEGRATION'];

function DomainBar({ domain, concepts }) {
  const ids = domain.conceptIds;
  const total = ids.length;
  const stageCounts = { UNSEEN: 0, ENCOUNTER: 0, TENSION: 0, PATTERN: 0, INTEGRATION: 0 };
  ids.forEach(id => {
    const stage = concepts[id]?.stage || 'UNSEEN';
    stageCounts[stage] = (stageCounts[stage] || 0) + 1;
  });

  return (
    <div className="domain-bar-row">
      <div className="domain-bar-header">
        <span className="domain-bar-name">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-gold)', marginRight: '6px' }}>
            D{domain.id}
          </span>
          {domain.name}
        </span>
        <span className="domain-bar-meta">{domain.weight}% · {total} concepts</span>
      </div>
      <div className="domain-bar-track" title={Object.entries(stageCounts).map(([s,n])=>`${s}:${n}`).join(' ')}>
        {STAGE_ORDER.map(stage => {
          const count = stageCounts[stage] || 0;
          if (count === 0) return null;
          return (
            <div
              key={stage}
              className="domain-bar-segment"
              style={{
                width: `${(count / total) * 100}%`,
                background: STAGES[stage].color,
                opacity: stage === 'UNSEEN' ? 0.3 : 1,
              }}
              title={`${stage}: ${count}`}
            />
          );
        })}
      </div>
    </div>
  );
}

function formatSessionTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const now = new Date();
  const diffMs = now - d;
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  if (diffH < 1) return 'just now';
  if (diffH < 24) return `${diffH}h ago`;
  if (diffD < 7) return `${diffD}d ago`;
  return d.toLocaleDateString();
}

const SESSION_TYPE_LABELS = {
  domain_study: 'DOMAIN',
  scenario: 'SCENARIO',
  antipattern: 'DRILL',
  review: 'REVIEW',
};

export function Dashboard({ state, navigate }) {
  const { concepts, sessions } = state;

  // Compute overall stats
  let encountered = 0, integrated = 0, inTension = 0, total = 0;
  Object.values(concepts).forEach(c => {
    total++;
    if (c.stage !== 'UNSEEN') encountered++;
    if (c.stage === 'INTEGRATION') integrated++;
    if (c.stage === 'TENSION') inTension++;
  });

  const due = getDueConcepts(concepts);
  const nextDue = due.length > 0
    ? null
    : Object.values(concepts)
        .filter(c => c.next_review && (c.stage === 'PATTERN' || c.stage === 'INTEGRATION'))
        .sort((a, b) => new Date(a.next_review) - new Date(b.next_review))[0];

  // Weak concepts (TENSION)
  const tensionConcepts = Object.values(concepts).filter(c => c.stage === 'TENSION');

  // Recent sessions
  const recentSessions = sessions.slice(0, 5);

  const isNewUser = encountered === 0;

  return (
    <div className="view" style={{ padding: '0' }}>
      {isNewUser && <WelcomeBanner navigate={navigate} />}

      <div className="view-header">
        <span className="view-title">
          <span>FORMATION</span> OVERVIEW
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
          {encountered}/{total} encountered · {integrated} integrated
        </span>
      </div>

      <div className="dashboard-grid">
        {/* ── Formation domains ── */}
        <div className="dashboard-cell">
          <div className="cell-label">Domain Progress</div>

          {!isNewUser && <NextStepWidget concepts={concepts} navigate={navigate} />}

          <div className="stats-row">
            <div className="stat-cell">
              <div className="stat-value gold">{encountered}</div>
              <div className="stat-label">Encountered</div>
            </div>
            <div className="stat-cell">
              <div className="stat-value green">{integrated}</div>
              <div className="stat-label">Integrated</div>
            </div>
            <div className="stat-cell">
              <div className="stat-value orange">{inTension}</div>
              <div className="stat-label">In Tension</div>
            </div>
            <div className="stat-cell">
              <div className="stat-value blue">{due.length}</div>
              <div className="stat-label">Due Review</div>
            </div>
          </div>

          {DOMAINS.map(domain => (
            <DomainBar key={domain.id} domain={domain} concepts={concepts} />
          ))}

          {/* Stage legend */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
            {STAGE_ORDER.map(s => (
              <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: STAGES[s].color, opacity: s === 'UNSEEN' ? 0.5 : 1 }}>
                {STAGES[s].symbol} {s}
              </span>
            ))}
          </div>
        </div>

        {/* ── Right column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)' }}>
          {/* SR queue */}
          <div className="dashboard-cell">
            <div className="cell-label">Review Queue</div>
            <div className="review-queue-box">
              <div className="review-queue-count">{due.length}</div>
              <div className="review-queue-label">concepts due for review</div>
              {due.length > 0 && (
                <button
                  className="btn btn-primary"
                  style={{ marginTop: '12px' }}
                  onClick={() => navigate('review')}
                >
                  Begin Review →
                </button>
              )}
            </div>
            {nextDue && (
              <div className="next-review-row">
                <span className="next-review-label">Next due</span>
                <span className="next-review-date">{formatNextReview(nextDue.next_review)}</span>
              </div>
            )}
            {!nextDue && due.length === 0 && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                {integrated + Object.values(concepts).filter(c=>c.stage==='PATTERN').length === 0
                  ? 'Study domains to add concepts to the review queue.'
                  : 'All caught up.'}
              </div>
            )}
          </div>

          {/* Weak areas */}
          <div className="dashboard-cell" style={{ flex: 1 }}>
            <div className="cell-label">Stuck in Tension</div>
            {tensionConcepts.length === 0 ? (
              <div className="empty-state" style={{ padding: '16px 0' }}>
                No concepts stuck in tension.
              </div>
            ) : (
              <div>
                {tensionConcepts.slice(0, 8).map(c => (
                  <div
                    key={c.id}
                    className="weak-concept-row"
                    onClick={() => navigate('study', { highlightDomain: CONCEPTS[c.id]?.domainId })}
                  >
                    <span className="weak-concept-id">{c.id}</span>
                    <span className="weak-concept-desc">{CONCEPTS[c.id]?.description}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-gold)' }}>
                      {STAGES.TENSION.symbol}
                    </span>
                  </div>
                ))}
                {tensionConcepts.length > 8 && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', paddingTop: '8px' }}>
                    +{tensionConcepts.length - 8} more
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent sessions */}
          <div className="dashboard-cell">
            <div className="cell-label">Recent Sessions</div>
            {recentSessions.length === 0 ? (
              <div className="empty-state" style={{ padding: '8px 0' }}>No sessions yet.</div>
            ) : (
              recentSessions.map((s, i) => (
                <div key={i} className="session-item">
                  <div className="session-type-badge">
                    {SESSION_TYPE_LABELS[s.type] || s.type}
                  </div>
                  <div className="session-meta">
                    <div className="session-time">{formatSessionTime(s.started_at)}</div>
                    <div className="session-concepts">
                      {s.concepts_touched?.length > 0
                        ? s.concepts_touched.slice(0, 5).join(', ') + (s.concepts_touched.length > 5 ? ' …' : '')
                        : s.label || '—'
                      }
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Study Resources */}
        <div style={{ marginTop: '24px' }}>
          <div className="cell-label" style={{ marginBottom: '12px' }}>Official Study Resources</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {STUDY_RESOURCES.map(section => (
              <div key={section.section}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {section.section}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {section.links.map(link => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '6px 10px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', textDecoration: 'none', gap: '12px' }}
                    >
                      <span style={{ fontSize: '12px', color: 'var(--accent-teal)' }}>{link.title}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>{link.description}</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
