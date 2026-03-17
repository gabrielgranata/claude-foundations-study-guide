import { useState, useRef, useEffect, useCallback } from 'react';
import { callClaude, compactMessages } from '../lib/api.js';

const COMMANDS = ['status', 'done'];

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function Message({ msg }) {
  const isAssistant = msg.role === 'assistant';
  const isSystemNote = msg.role === 'system-note';
  const isUser = msg.role === 'user';

  let roleLabel = isAssistant ? 'CLAUDE' : isSystemNote ? 'SYSTEM' : 'YOU';
  let roleClass = isAssistant ? 'assistant' : isSystemNote ? 'system-note' : 'user';

  return (
    <div className={`message ${roleClass}`}>
      <div className="message-header">
        <span className={`message-role ${roleClass}`}>{roleLabel}</span>
        <span className="message-time">{formatTime(new Date(msg.timestamp))}</span>
      </div>
      <div className={`message-body ${roleClass}`}>
        {msg.content}
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="thinking-indicator">
      <div className="thinking-pulse" />
    </div>
  );
}

export function ConversationInterface({
  apiKey,
  systemPrompt,
  initialMessage,
  onCommand,
  onRequestApiKey,
  conceptsTouched,
  onConceptTouch,
  sessionActive,
  onEndSession,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // API conversation history (without timestamps/meta)
  const conversationRef = useRef([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  // Start the session by getting the first AI message
  useEffect(() => {
    if (!started && sessionActive) {
      setStarted(true);
      startSession();
    }
  }, [sessionActive]);

  async function startSession() {
    if (!apiKey) {
      setError('No API key configured. Click the key indicator in the sidebar to add one.');
      return;
    }

    const openingMsg = initialMessage || 'Begin the session. Present an opening scenario.';
    const userMsg = { role: 'user', content: openingMsg };
    conversationRef.current = [userMsg];

    setThinking(true);
    setError('');

    try {
      const response = await callClaude({
        apiKey,
        systemPrompt,
        messages: conversationRef.current,
        maxTokens: 1024,
      });

      const assistantMsg = { role: 'assistant', content: response };
      conversationRef.current.push(assistantMsg);

      setMessages([
        { role: 'assistant', content: response, timestamp: Date.now() },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setThinking(false);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || thinking) return;

    setInput('');

    // Parse commands
    const lower = text.toLowerCase();

    if (lower === 'done' || lower === '/done') {
      onEndSession?.();
      return;
    }

    if (lower === 'status') {
      const statusContent = onCommand?.('status') || 'No status available.';
      setMessages(prev => [
        ...prev,
        { role: 'user', content: text, timestamp: Date.now() },
        { role: 'system-note', content: statusContent, timestamp: Date.now() },
      ]);
      return;
    }

    // advance [concept_id] [STAGE]
    const advanceMatch = text.match(/^advance\s+([\d.]+)\s+(\w+)$/i);
    if (advanceMatch) {
      const [, conceptId, stage] = advanceMatch;
      const result = onCommand?.('advance', conceptId, stage.toUpperCase());
      setMessages(prev => [
        ...prev,
        { role: 'user', content: text, timestamp: Date.now() },
        { role: 'system-note', content: result || `Stage updated: ${conceptId} → ${stage.toUpperCase()}`, timestamp: Date.now() },
      ]);
      return;
    }

    // Regular message — send to API
    if (!apiKey) {
      onRequestApiKey?.();
      return;
    }

    const userDisplayMsg = { role: 'user', content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userDisplayMsg]);

    const userApiMsg = { role: 'user', content: text };
    conversationRef.current.push(userApiMsg);

    // Compact if needed
    conversationRef.current = compactMessages(conversationRef.current);

    setThinking(true);
    setError('');

    try {
      const response = await callClaude({
        apiKey,
        systemPrompt,
        messages: conversationRef.current,
        maxTokens: 1024,
      });

      const assistantMsg = { role: 'assistant', content: response };
      conversationRef.current.push(assistantMsg);

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response, timestamp: Date.now() },
      ]);
    } catch (err) {
      setError(err.message);
      // Remove the user message from API history if it failed
      conversationRef.current.pop();
    } finally {
      setThinking(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInputChange(e) {
    setInput(e.target.value);
    // Auto-resize
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Messages */}
      <div className="conversation-container" ref={scrollRef}>
        <div className="conversation-messages">
          {messages.length === 0 && !thinking && !error && (
            <div style={{ padding: '32px 24px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              {apiKey ? 'Initializing session...' : 'Configure an API key to begin.'}
            </div>
          )}

          {messages.map((msg, i) => (
            <Message key={i} msg={msg} />
          ))}

          {thinking && <ThinkingIndicator />}

          {error && (
            <div className="error-bar" style={{ margin: '12px 24px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', marginRight: '8px' }}>ERROR</span>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      {sessionActive && (
        <div className="input-bar">
          <div className="input-row">
            <textarea
              ref={inputRef}
              className="input-field"
              placeholder="Respond to the scenario..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={thinking}
              rows={1}
            />
            <button
              className="btn btn-send"
              onClick={handleSend}
              disabled={!input.trim() || thinking}
              title="Send (Enter)"
            >
              ↑
            </button>
          </div>
          <div className="input-hint">
            <span><span className="input-hint-cmd">Enter</span> to send · <span className="input-hint-cmd">Shift+Enter</span> for newline</span>
            <span><span className="input-hint-cmd">status</span> · <span className="input-hint-cmd">advance [id] [STAGE]</span> · <span className="input-hint-cmd">done</span></span>
          </div>
        </div>
      )}
    </div>
  );
}
