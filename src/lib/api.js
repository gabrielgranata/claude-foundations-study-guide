// ═══════════════════════════════════════════════════════
// BEDROCK API CLIENT (via local proxy)
// ═══════════════════════════════════════════════════════

const API_URL = '/api/chat';

export async function callClaude({ systemPrompt, messages, maxTokens = 1024 }) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system: systemPrompt,
      messages,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    let msg = `API error ${response.status}`;
    try { msg = (await response.json()).error || msg; } catch {}
    throw new Error(msg);
  }

  return (await response.json()).text;
}

export function compactMessages(messages) {
  if (messages.length <= 22) return messages;
  return [...messages.slice(0, 2), ...messages.slice(-16)];
}
