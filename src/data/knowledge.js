// ═══════════════════════════════════════════════════════
// CCA STUDY GUIDE — KNOWLEDGE BASE
// ═══════════════════════════════════════════════════════

export const STAGE_ORDER = ['UNSEEN', 'ENCOUNTER', 'TENSION', 'PATTERN', 'INTEGRATION'];

export const STAGES = {
  UNSEEN:      { label: 'UNSEEN',      symbol: '○', color: '#4a4a4f', bgColor: 'rgba(74,74,79,0.15)' },
  ENCOUNTER:   { label: 'ENCOUNTER',   symbol: '◐', color: '#5AC8D8', bgColor: 'rgba(90,200,216,0.15)' },
  TENSION:     { label: 'TENSION',     symbol: '◑', color: '#C8A55A', bgColor: 'rgba(200,165,90,0.15)' },
  PATTERN:     { label: 'PATTERN',     symbol: '◕', color: '#6AACB8', bgColor: 'rgba(106,172,184,0.15)' },
  INTEGRATION: { label: 'INTEGRATION', symbol: '●', color: '#4CAF7D', bgColor: 'rgba(76,175,125,0.15)' },
};

export const DOMAINS = [
  {
    id: 1,
    name: 'Agentic Architecture & Orchestration',
    weight: 27,
    conceptIds: ['1.1','1.2','1.3','1.4','1.5','1.6','1.7','1.8','1.9','1.10'],
  },
  {
    id: 2,
    name: 'Tool Design & MCP Integration',
    weight: 18,
    conceptIds: ['2.1','2.2','2.3','2.4','2.5','2.6','2.7','2.8'],
  },
  {
    id: 3,
    name: 'Claude Code Configuration & Workflows',
    weight: 20,
    conceptIds: ['3.1','3.2','3.3','3.4','3.5','3.6','3.7','3.8','3.9'],
  },
  {
    id: 4,
    name: 'Prompt Engineering & Structured Output',
    weight: 20,
    conceptIds: ['4.1','4.2','4.3','4.4','4.5','4.6','4.7','4.8','4.9'],
  },
  {
    id: 5,
    name: 'Context Management & Reliability',
    weight: 15,
    conceptIds: ['5.1','5.2','5.3','5.4','5.5','5.6','5.7','5.8'],
  },
];

export const CONCEPTS = {
  '1.1':  { id: '1.1',  domainId: 1, description: 'Agentic loop structure (prompt → tool_use → tool_result → synthesis)' },
  '1.2':  { id: '1.2',  domainId: 1, description: 'Coordinator-subagent pattern and delegation design' },
  '1.3':  { id: '1.3',  domainId: 1, description: 'Session state management and isolation between agents' },
  '1.4':  { id: '1.4',  domainId: 1, description: 'Task decomposition strategies for multi-agent systems' },
  '1.5':  { id: '1.5',  domainId: 1, description: 'Forking conversations for parallel exploration' },
  '1.6':  { id: '1.6',  domainId: 1, description: 'stop_reason-based loop termination (not NL parsing)' },
  '1.7':  { id: '1.7',  domainId: 1, description: 'Agent memory: short-term (conversation) vs long-term (external store)' },
  '1.8':  { id: '1.8',  domainId: 1, description: 'Error boundaries in multi-agent orchestration' },
  '1.9':  { id: '1.9',  domainId: 1, description: 'When to use single-agent vs multi-agent architectures' },
  '1.10': { id: '1.10', domainId: 1, description: 'Stateless inference and context reconstruction patterns' },

  '2.1':  { id: '2.1',  domainId: 2, description: 'Tool description quality and how it affects model selection' },
  '2.2':  { id: '2.2',  domainId: 2, description: 'Structured error responses from tools (not raw exceptions)' },
  '2.3':  { id: '2.3',  domainId: 2, description: 'Scoping tools per agent role (4-5 tools max per agent)' },
  '2.4':  { id: '2.4',  domainId: 2, description: 'MCP server configuration and transport protocols' },
  '2.5':  { id: '2.5',  domainId: 2, description: 'Tool parameter design: explicit types, enums, constraints' },
  '2.6':  { id: '2.6',  domainId: 2, description: 'Idempotent vs non-idempotent tools and retry implications' },
  '2.7':  { id: '2.7',  domainId: 2, description: 'Tool result formatting for context efficiency' },
  '2.8':  { id: '2.8',  domainId: 2, description: 'Dynamic tool registration vs static tool sets' },

  '3.1':  { id: '3.1',  domainId: 3, description: 'CLAUDE.md hierarchy (project root, subdirectory, user-level)' },
  '3.2':  { id: '3.2',  domainId: 3, description: 'Custom slash commands and skills authoring' },
  '3.3':  { id: '3.3',  domainId: 3, description: 'Path-specific rules and their precedence' },
  '3.4':  { id: '3.4',  domainId: 3, description: 'Plan mode vs direct execution mode' },
  '3.5':  { id: '3.5',  domainId: 3, description: 'CI/CD integration patterns with Claude Code' },
  '3.6':  { id: '3.6',  domainId: 3, description: 'Session management: fresh sessions vs long-running' },
  '3.7':  { id: '3.7',  domainId: 3, description: 'Context engineering for Claude Code (what to include, what to omit)' },
  '3.8':  { id: '3.8',  domainId: 3, description: 'Headless mode and non-interactive execution' },
  '3.9':  { id: '3.9',  domainId: 3, description: 'Multi-repo and monorepo configuration patterns' },

  '4.1':  { id: '4.1',  domainId: 4, description: 'Few-shot prompting: example selection and ordering' },
  '4.2':  { id: '4.2',  domainId: 4, description: 'JSON schema via tool_use for structured outputs' },
  '4.3':  { id: '4.3',  domainId: 4, description: 'Validation-retry loops for output conformance' },
  '4.4':  { id: '4.4',  domainId: 4, description: 'Message Batches API for throughput workloads' },
  '4.5':  { id: '4.5',  domainId: 4, description: 'System prompt design: altitude and specificity tradeoffs' },
  '4.6':  { id: '4.6',  domainId: 4, description: 'Chain-of-thought prompting and when it helps vs hurts' },
  '4.7':  { id: '4.7',  domainId: 4, description: 'Prefilling assistant messages for output steering' },
  '4.8':  { id: '4.8',  domainId: 4, description: 'Token budget management and response truncation handling' },
  '4.9':  { id: '4.9',  domainId: 4, description: 'Temperature and sampling parameter selection by task type' },

  '5.1':  { id: '5.1',  domainId: 5, description: 'Context window degradation and the n² attention problem' },
  '5.2':  { id: '5.2',  domainId: 5, description: 'Escalation design in multi-agent error propagation' },
  '5.3':  { id: '5.3',  domainId: 5, description: 'Human-in-the-loop review workflows and approval gates' },
  '5.4':  { id: '5.4',  domainId: 5, description: 'Per-document-type accuracy vs aggregate accuracy metrics' },
  '5.5':  { id: '5.5',  domainId: 5, description: 'Context compaction: summarize-and-reinitiate patterns' },
  '5.6':  { id: '5.6',  domainId: 5, description: 'Graceful degradation when context limits are reached' },
  '5.7':  { id: '5.7',  domainId: 5, description: 'Observability: logging tool calls, token usage, decision traces' },
  '5.8':  { id: '5.8',  domainId: 5, description: 'Rate limiting, retry strategies, and backoff for API reliability' },
};

export const SCENARIOS = [
  {
    id: 'S1',
    name: 'Customer Support Resolution Agent',
    description: 'A customer support system using Claude to handle ticket resolution. Involves intent classification, knowledge base retrieval, response generation, and escalation to human agents when confidence is low.',
    primaryDomains: [1, 2, 5],
    keyConcepts: ['1.1', '1.6', '2.1', '2.2', '5.2', '5.3'],
  },
  {
    id: 'S2',
    name: 'Code Generation with Claude Code',
    description: 'Using Claude Code for feature development in a production codebase. Covers session setup, CLAUDE.md configuration, plan mode for complex changes, and validation of generated code.',
    primaryDomains: [3, 4],
    keyConcepts: ['3.1', '3.4', '3.6', '3.7', '4.5', '4.6'],
  },
  {
    id: 'S3',
    name: 'Multi-Agent Research System',
    description: 'A coordinator agent that delegates to specialist agents (search, analysis, synthesis) to produce research reports. Involves task decomposition, state management, and result aggregation.',
    primaryDomains: [1, 2, 5],
    keyConcepts: ['1.2', '1.3', '1.4', '1.8', '2.3', '5.1'],
  },
  {
    id: 'S4',
    name: 'Developer Productivity with Claude',
    description: 'Integrating Claude into a development team\'s workflow — PR reviews, documentation generation, test creation. Covers prompt engineering for consistent output and team-wide configuration.',
    primaryDomains: [3, 4, 5],
    keyConcepts: ['3.1', '3.2', '3.5', '4.1', '4.2', '5.7'],
  },
  {
    id: 'S5',
    name: 'Claude Code for CI/CD',
    description: 'Running Claude Code in headless mode within CI/CD pipelines — automated code review, test generation, migration scripts. Covers non-interactive execution, output validation, and pipeline integration.',
    primaryDomains: [3, 4, 5],
    keyConcepts: ['3.5', '3.8', '4.3', '4.4', '5.6', '5.8'],
  },
  {
    id: 'S6',
    name: 'Structured Data Extraction',
    description: 'Extracting structured data from unstructured documents (invoices, contracts, medical records). Involves schema definition via tool_use, validation loops, and per-document-type accuracy tracking.',
    primaryDomains: [2, 4, 5],
    keyConcepts: ['2.1', '2.2', '4.2', '4.3', '5.4', '5.7'],
  },
];

export const ANTI_PATTERNS = [
  {
    id: 'AP1',
    name: 'Natural language loop termination',
    summary: 'Parsing model output text to decide when to stop, instead of using stop_reason.',
    why: 'NL is ambiguous and brittle. The model might phrase completion differently across runs. stop_reason is deterministic — end_turn means the model decided it\'s done; tool_use means it wants to act.',
    relatedConcepts: ['1.1', '1.6'],
    language: 'python',
    snippet: `# The agent loop
while True:
    response = call_claude(messages)
    text = response['content'][0]['text']
    if 'I have completed the task' in text or 'DONE' in text.upper():
        break
    messages.append({"role": "assistant", "content": response['content']})
    # ... process tool calls`,
  },
  {
    id: 'AP2',
    name: 'Prompt-based enforcement for critical business rules',
    summary: 'Relying on system prompt instructions to enforce business-critical constraints instead of programmatic guardrails.',
    why: 'Prompts are probabilistic. They will be violated under adversarial input, unusual phrasing, or context pressure. Critical business rules need deterministic enforcement outside the model.',
    relatedConcepts: ['4.5', '5.3'],
    language: 'python',
    snippet: `system_prompt = """
You are a refund processing agent.
IMPORTANT: Never approve refunds over $500.
IMPORTANT: Always verify the customer's identity before processing.
If the refund amount exceeds $500, deny the request.
"""
# No programmatic check on the refund amount
result = call_claude(system_prompt, user_request)
process_refund(result['approved_amount'])`,
  },
  {
    id: 'AP3',
    name: 'Same-session self-review',
    summary: 'Asking the model to review its own output in the same conversation session where it generated that output.',
    why: 'The model has its own output in context and is biased toward confirming it. Self-review in the same session produces systematically overconfident assessments. Use a separate session with fresh context for review.',
    relatedConcepts: ['1.3', '1.5', '5.1'],
    language: 'python',
    snippet: `# Generate code
messages = [{"role": "user", "content": "Write a function to parse CSV files"}]
code_response = call_claude(messages)

# Review in same session
messages.append({"role": "assistant", "content": code_response})
messages.append({"role": "user", "content": "Now review the code you just wrote for bugs"})
review_response = call_claude(messages)  # biased by own output`,
  },
  {
    id: 'AP4',
    name: 'Too many tools per agent',
    summary: 'Giving a single agent access to 15+ tools, forcing it to select among too many options.',
    why: 'Tool selection quality degrades with tool count. The model spends more attention on choosing which tool than on reasoning about the problem. Keep to 4-5 tools per agent. Use multi-agent delegation if you need more tools.',
    relatedConcepts: ['2.3', '1.2', '1.9'],
    language: 'python',
    snippet: `tools = [
    search_web, search_database, search_vector_store,
    read_file, write_file, delete_file, list_files,
    send_email, send_slack, send_sms,
    create_ticket, update_ticket, close_ticket,
    query_api, post_api, run_sql, execute_code,
    generate_image, convert_format
]
response = call_claude(messages, tools=tools)  # 19 tools`,
  },
  {
    id: 'AP5',
    name: 'Aggregate accuracy masking per-type failures',
    summary: 'Reporting 95% overall accuracy while specific document types are at 40%.',
    why: 'Aggregate metrics hide distribution-specific failures. A system that\'s 95% accurate overall but 40% on a critical document type is unreliable for that type. Per-type metrics and per-type thresholds are required.',
    relatedConcepts: ['5.4', '5.7'],
    language: 'python',
    snippet: `# Evaluation
results = evaluate_all_documents(pipeline, test_set)
accuracy = sum(r['correct'] for r in results) / len(results)
print(f"Pipeline accuracy: {accuracy:.1%}")  # 95.2%
# Never checked: handwritten invoices are 41%, scanned receipts are 38%`,
  },
  {
    id: 'AP6',
    name: 'Unbounded context accumulation',
    summary: 'Appending every tool result and response to the conversation without summarization or truncation.',
    why: 'Context quality degrades as it grows — the n² attention problem means each new token dilutes attention to all existing tokens. Tool results should be summarized, irrelevant history should be compacted, and sessions should be refreshed frequently.',
    relatedConcepts: ['5.1', '5.5', '3.6'],
    language: 'python',
    snippet: `messages = [{"role": "user", "content": initial_task}]
while not done:
    response = call_claude(messages)
    messages.append({"role": "assistant", "content": response['content']})
    for tool_call in extract_tool_calls(response):
        result = execute_tool(tool_call)  # could be 10KB+ of data
        messages.append({"role": "user", "content": [
            {"type": "tool_result", "content": result}  # full, uncompressed
        ]})
    # messages grows without bound`,
  },
  {
    id: 'AP7',
    name: 'Raw exception propagation from tools',
    summary: 'Returning raw Python tracebacks or system errors as tool results instead of structured, actionable error responses.',
    why: 'The model can\'t reason about a raw traceback. Structured errors with error_type, message, and suggested_action let the model decide whether to retry, try an alternative, or escalate. Raw errors waste context tokens on noise.',
    relatedConcepts: ['2.2', '2.7', '1.8'],
    language: 'python',
    snippet: `def execute_tool(tool_name, params):
    try:
        return tool_registry[tool_name](**params)
    except Exception as e:
        return {"type": "tool_result", "content": str(e)}
        # Returns: "Traceback (most recent call last):\\n  File..."`,
  },
  {
    id: 'AP8',
    name: 'Overloaded CLAUDE.md with contradictory rules',
    summary: 'A single CLAUDE.md file with 200+ lines of instructions, some contradicting each other, with no hierarchy or path-specific scoping.',
    why: 'Long instruction files suffer the same context degradation as conversations. Rules contradict, later rules shadow earlier ones unpredictably. Use hierarchical CLAUDE.md (project root + subdirectory overrides), keep each file focused, and use path-specific rules for module-level guidance.',
    relatedConcepts: ['3.1', '3.3', '4.5'],
    language: 'text',
    snippet: `# CLAUDE.md (347 lines, single file at project root)
Always use TypeScript strict mode.
...
[150 lines later]
For the legacy/ directory, JavaScript is acceptable.
...
[80 lines later]
All files must pass TypeScript strict checks before commit.
# Contradiction: legacy/ can use JS but must pass TS strict?`,
  },
];

// ── Curriculum: recommended study sequence ────────────────
// Ordered by: exam weight × concept dependency depth
// Start with the mechanisms that everything else builds on.

export const CURRICULUM_MODULES = [
  {
    id: 'M1',
    title: 'The Agentic Loop',
    subtitle: 'How Claude actually runs — the fundamental cycle',
    phase: 1,
    phaseLabel: 'Foundation',
    estimatedMinutes: 40,
    domainIds: [1],
    conceptIds: ['1.1', '1.6', '1.10'],
    why: 'Everything else in the exam — tool use, multi-agent, session management — is built on the basic request/response/tool loop. If this mechanism is unclear, everything downstream will be shaky.',
    prerequisiteIds: [],
    docsLinks: [
      { label: 'Tool use overview', url: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use' },
      { label: 'Agents overview', url: 'https://docs.anthropic.com/en/docs/build-with-claude/computer-use' },
    ],
  },
  {
    id: 'M2',
    title: 'Tool Design That Actually Works',
    subtitle: 'Why tool descriptions and error handling make or break agents',
    phase: 1,
    phaseLabel: 'Foundation',
    estimatedMinutes: 35,
    domainIds: [2],
    conceptIds: ['2.1', '2.2', '2.5', '2.7'],
    why: 'Tool description quality directly affects whether the model selects the right tool. Structured error responses determine whether agents can recover from failures. These are tested heavily.',
    prerequisiteIds: ['M1'],
    docsLinks: [
      { label: 'Tool use: defining tools', url: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use' },
      { label: 'Error handling patterns', url: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use' },
    ],
  },
  {
    id: 'M3',
    title: 'Multi-Agent Architecture',
    subtitle: 'Coordinator-subagent patterns, task decomposition, isolation',
    phase: 2,
    phaseLabel: 'Architecture',
    estimatedMinutes: 50,
    domainIds: [1],
    conceptIds: ['1.2', '1.3', '1.4', '1.5', '1.8', '1.9'],
    why: 'Domain 1 is 27% of the exam. Multi-agent patterns — when to use them, how to isolate session state, how to handle errors across agent boundaries — are the most complex concepts here.',
    prerequisiteIds: ['M1', 'M2'],
    docsLinks: [
      { label: 'Multi-agent systems', url: 'https://docs.anthropic.com/en/docs/build-with-claude/computer-use' },
    ],
  },
  {
    id: 'M4',
    title: 'Claude Code Fundamentals',
    subtitle: 'CLAUDE.md hierarchy, session management, plan mode',
    phase: 2,
    phaseLabel: 'Architecture',
    estimatedMinutes: 40,
    domainIds: [3],
    conceptIds: ['3.1', '3.3', '3.4', '3.6', '3.7'],
    why: 'Domain 3 is 20% of the exam. Claude Code has specific configuration semantics — CLAUDE.md hierarchy, path-specific rules, plan vs. execute mode — that are uniquely testable.',
    prerequisiteIds: ['M1'],
    docsLinks: [
      { label: 'Claude Code overview', url: 'https://docs.anthropic.com/en/docs/claude-code/overview' },
      { label: 'CLAUDE.md reference', url: 'https://docs.anthropic.com/en/docs/claude-code/memory' },
      { label: 'Settings & config', url: 'https://docs.anthropic.com/en/docs/claude-code/settings' },
    ],
  },
  {
    id: 'M5',
    title: 'Prompt Engineering That Scales',
    subtitle: 'Structured output, few-shot patterns, system prompt design',
    phase: 3,
    phaseLabel: 'Engineering',
    estimatedMinutes: 45,
    domainIds: [4],
    conceptIds: ['4.1', '4.2', '4.3', '4.5', '4.6', '4.7'],
    why: 'Domain 4 is 20% of the exam. The exam heavily tests practical prompt patterns — when chain-of-thought helps vs. hurts, how to enforce structure via tool_use, validation-retry loops.',
    prerequisiteIds: ['M2'],
    docsLinks: [
      { label: 'Prompt engineering', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering' },
      { label: 'Structured output', url: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use' },
    ],
  },
  {
    id: 'M6',
    title: 'MCP & Advanced Tool Patterns',
    subtitle: 'MCP servers, scoping, idempotency, dynamic registration',
    phase: 3,
    phaseLabel: 'Engineering',
    estimatedMinutes: 35,
    domainIds: [2],
    conceptIds: ['2.3', '2.4', '2.6', '2.8'],
    why: 'MCP is increasingly tested as it becomes core Anthropic infrastructure. Tool scoping (4-5 tools per agent) and idempotency distinctions appear in scenario questions.',
    prerequisiteIds: ['M2', 'M3'],
    docsLinks: [
      { label: 'MCP overview', url: 'https://docs.anthropic.com/en/docs/mcp' },
      { label: 'Claude Code MCP', url: 'https://docs.anthropic.com/en/docs/claude-code/mcp' },
    ],
  },
  {
    id: 'M7',
    title: 'Context & Reliability',
    subtitle: 'Context degradation, escalation, compaction, observability',
    phase: 4,
    phaseLabel: 'Reliability',
    estimatedMinutes: 40,
    domainIds: [5],
    conceptIds: ['5.1', '5.2', '5.3', '5.5', '5.6', '5.7', '5.8'],
    why: 'Domain 5 is 15% but contains some of the most nuanced concepts — the n² attention problem, graceful degradation strategies, human-in-the-loop design. High discriminator on the exam.',
    prerequisiteIds: ['M3'],
    docsLinks: [
      { label: 'Context windows', url: 'https://docs.anthropic.com/en/docs/build-with-claude/context-windows' },
      { label: 'Errors & reliability', url: 'https://docs.anthropic.com/en/docs/api/errors' },
    ],
  },
  {
    id: 'M8',
    title: 'Claude Code in Production',
    subtitle: 'CI/CD integration, headless mode, throughput patterns',
    phase: 4,
    phaseLabel: 'Reliability',
    estimatedMinutes: 30,
    domainIds: [3, 4],
    conceptIds: ['3.2', '3.5', '3.8', '3.9', '4.4', '4.8', '4.9', '5.4'],
    why: 'The exam tests operational patterns — running Claude Code non-interactively, batching for throughput, handling token budgets. These concepts appear in CI/CD and extraction scenarios.',
    prerequisiteIds: ['M4', 'M5'],
    docsLinks: [
      { label: 'Claude Code CI/CD', url: 'https://docs.anthropic.com/en/docs/claude-code/github-actions' },
      { label: 'Message Batches API', url: 'https://docs.anthropic.com/en/docs/build-with-claude/message-batches' },
    ],
  },
];

// Ordered list of phase labels for display
export const CURRICULUM_PHASES = [
  { id: 1, label: 'Foundation', description: 'The mechanisms everything builds on' },
  { id: 2, label: 'Architecture', description: 'Multi-agent and configuration patterns' },
  { id: 3, label: 'Engineering', description: 'Prompting and tool design at scale' },
  { id: 4, label: 'Reliability', description: 'Production operations and edge cases' },
];
