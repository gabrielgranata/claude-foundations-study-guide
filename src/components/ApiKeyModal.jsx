import { useState } from 'react';

export function ApiKeyModal({ existingKey, onSave, onClose }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  function handleSave() {
    const trimmed = value.trim();
    if (!trimmed.startsWith('sk-ant-')) {
      setError('API key should start with sk-ant-');
      return;
    }
    onSave(trimmed);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onClose();
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="overlay-panel apikey-modal">
        <div className="overlay-header">
          <div className="overlay-title">ANTHROPIC API KEY</div>
          <div className="overlay-subtitle">
            Required for AI study sessions. Stored in localStorage only.
          </div>
        </div>
        <div className="overlay-body">
          {existingKey && (
            <div style={{ marginBottom: '16px', padding: '10px 12px', background: 'var(--bg-panel-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>CURRENT KEY</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-teal)' }}>
                sk-ant-···{existingKey.slice(-4)}
              </div>
            </div>
          )}

          <label className="apikey-label" htmlFor="apikey-input">
            {existingKey ? 'Replace with new key' : 'Enter your API key'}
          </label>
          <input
            id="apikey-input"
            className="apikey-input"
            type="password"
            placeholder="sk-ant-api03-..."
            value={value}
            onChange={e => { setValue(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          {error && (
            <div style={{ color: 'var(--accent-orange)', fontSize: '12px', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
              {error}
            </div>
          )}
          <div className="apikey-note">
            Your key is sent directly to api.anthropic.com from your browser. It is never stored on any server.
            Get a key at console.anthropic.com.
          </div>
        </div>
        <div className="overlay-footer">
          {existingKey && (
            <button className="btn btn-danger" onClick={() => onSave(null)}>
              Remove key
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!value.trim()}>
            Save key
          </button>
        </div>
      </div>
    </div>
  );
}
