// ═══════════════════════════════════════════════════════
// ANTHROPIC API CLIENT
// ═══════════════════════════════════════════════════════

const MODEL = 'claude-sonnet-4-20250514';
const API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Call the Anthropic Messages API.
 * @param {Object} params
 * @param {string} params.apiKey
 * @param {string} params.systemPrompt
 * @param {Array}  params.messages - [{role, content}]
 * @param {number} [params.maxTokens]
 * @returns {Promise<string>} - assistant text response
 */
export async function callClaude({ apiKey, systemPrompt, messages, maxTokens = 1024 }) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    let msg = `API error ${response.status}`;
    try {
      const err = await response.json();
      msg = err.error?.message || msg;
    } catch {}
    throw new Error(msg);
  }

  const data = await response.json();
  return data.content[0].text;
}

/**
 * Compact conversation history when it grows too long.
 * Strategy: keep first 2 messages + last 16 messages.
 * The "summarize middle" step would require an additional API call
 * and is left as a future enhancement.
 */
export function compactMessages(messages) {
  if (messages.length <= 22) return messages;
  const head = messages.slice(0, 2);
  const tail = messages.slice(-16);
  return [...head, ...tail];
}
