import { getDueConcepts } from '../lib/sm2.js';

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',        icon: '▦' },
  { id: 'study',        label: 'Study Domain',      icon: '◈' },
  { id: 'scenario',     label: 'Scenario Dive',     icon: '⬡' },
  { id: 'antipattern',  label: 'Anti-Patterns',     icon: '⚠' },
  { id: 'review',       label: 'Quick Review',      icon: '↺' },
];

export function Sidebar({ currentView, navigate, state, onApiKeyClick }) {
  const due = getDueConcepts(state.concepts);
  const dueCount = due.length;

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">CCA FOUNDATIONS</div>
        <div className="sidebar-sub">STUDY GUIDE</div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {NAV_ITEMS.map(item => (
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
