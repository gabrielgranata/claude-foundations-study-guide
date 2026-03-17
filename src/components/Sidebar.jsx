import { getDueConcepts } from '../lib/sm2.js';

const NAV_SECTIONS = [
  {
    label: 'Start here',
    items: [
      { id: 'curriculum',   label: 'Curriculum',       icon: '⊞' },
      { id: 'learn',        label: 'Learn Center',      icon: '⊡' },
    ],
  },
  {
    label: 'Practice',
    items: [
      { id: 'study',        label: 'Study Domain',      icon: '◈' },
      { id: 'scenario',     label: 'Scenario Dive',     icon: '⬡' },
      { id: 'antipattern',  label: 'Anti-Patterns',     icon: '⚠' },
    ],
  },
  {
    label: 'Test',
    items: [
      { id: 'exam',         label: 'Practice Exam',     icon: '✦' },
      { id: 'review',       label: 'Quick Review',      icon: '↺' },
    ],
  },
  {
    label: 'Overview',
    items: [
      { id: 'dashboard',    label: 'Dashboard',         icon: '▦' },
    ],
  },
];

export function Sidebar({ currentView, navigate, state, onApiKeyClick }) {
  const due = getDueConcepts(state.concepts);
  const dueCount = due.length;

  // Count cached references
  const refCount = Object.keys(state.referenceCache || {}).length;

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">CCA FOUNDATIONS</div>
        <div className="sidebar-sub">STUDY GUIDE</div>
      </div>

      <nav className="sidebar-nav">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map(item => (
              <div
                key={item.id}
                className={`sidebar-item${currentView === item.id ? ' active' : ''}`}
                onClick={() => navigate(item.id)}
              >
                <span className="sidebar-item-icon">{item.icon}</span>
                <span className="sidebar-item-label">{item.label}</span>
                {item.id === 'review' && dueCount > 0 && (
                  <span className="sidebar-item-badge">{dueCount}</span>
                )}
                {item.id === 'learn' && refCount > 0 && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--accent-teal)' }}>
                    {refCount}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-key-status" onClick={onApiKeyClick}>
          <div className={`sidebar-key-dot ${state.apiKey ? '' : 'missing'}`} />
          {state.apiKey ? (
            <span>···{state.apiKey.slice(-4)}</span>
          ) : (
            <span>No API key</span>
          )}
        </div>
      </div>
    </aside>
  );
}
