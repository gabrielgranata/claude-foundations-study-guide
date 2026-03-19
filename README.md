# CCA Foundations Study Guide

An interactive study tool for the [Claude Certified Architect – Foundations](https://anthropic.skilljar.com/claude-certified-architect-foundations-access-request) exam.

This is not a flashcard app. It's a Socratic scaffold — it creates encounters with the material, probes your reasoning, and refuses to give you the answer. Understanding forms through the struggle, not around it.

## How it works

The tool tracks your understanding of each concept through a formation cycle:

**UNSEEN → ENCOUNTER → TENSION → PATTERN → INTEGRATION**

- **Curriculum** — guided learning path with prerequisite-based module unlocking
- **Learn Center** — browse concepts with links to official Anthropic docs, generate AI-powered reference notes
- **Study Domain** — Socratic AI sessions that probe your understanding of a domain's concepts
- **Scenario Deep Dive** — architect a system while the AI challenges every design decision
- **Anti-Pattern Drills** — identify what's wrong in code snippets and explain the mechanism
- **Practice Exam** — Claude-generated multiple-choice questions (different every session)
- **Quick Review** — spaced repetition that presents concepts in new scenarios, not flashcards
- **Dashboard** — progress overview with links to all official study resources

Conversations persist across sessions — you can resume where you left off.

## Quick start

### Prerequisites

- Node.js 18+
- An Anthropic API key **or** AWS credentials with Bedrock access to Claude Sonnet

### Install

```bash
git clone https://github.com/gabrielgranata/claude-foundations-study-guide.git
cd claude-foundations-study-guide
npm install
```

### Configure your AI backend

```bash
cp .env.example .env
```

**Option A: Anthropic API key** (simplest — works anywhere)

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get a key at [console.anthropic.com](https://console.anthropic.com/).

**Option B: AWS Bedrock** (for those with AWS access)

Leave `ANTHROPIC_API_KEY` unset. The server uses your AWS credential chain:

```env
AWS_PROFILE=your-profile
AWS_REGION=us-east-1
```

Requires Bedrock model access for Claude Sonnet (`us.anthropic.claude-sonnet-4-6` or similar). To check available models:

```bash
aws bedrock list-inference-profiles --query "inferenceProfileSummaries[?contains(inferenceProfileId, 'sonnet')].inferenceProfileId" --output text
```

If using named AWS profiles, set `AWS_PROFILE` to your profile name.

### Run

Two terminals:

```bash
# Terminal 1: API proxy + state server
node server.js

# Terminal 2: Frontend dev server
npx vite
```

Open http://localhost:5173

The server logs which backend it's using on startup:
```
Backend: Anthropic API (claude-sonnet-4-20250514)
Proxy on :3456 (db: ./study_guide.db)
```

### State persistence

All progress is saved to a local SQLite database (`study_guide.db`) via the server, with localStorage as a fast cache. Your progress survives browser refreshes, clearing browser data, and server restarts.

## Exam overview

The CCA Foundations exam covers 5 domains:

| Domain | Weight |
|--------|--------|
| Agentic Architecture & Orchestration | ~25% |
| Tool Design & MCP Integration | ~20% |
| Claude Code Configuration & Workflows | ~20% |
| Prompt Engineering & Structured Output | ~20% |
| Context Management & Reliability | ~15% |

60 multiple-choice questions, scenario-based. You get 4 of 6 possible scenarios. Passing score: 720/1000.

## Official study resources

The tool links to these throughout, but here they are in one place:

**Anthropic Academy** (free courses with certificates):
- [Claude 101](https://anthropic.skilljar.com/) — baseline knowledge
- [Building Applications with the Claude API](https://anthropic.skilljar.com/) — 8+ hours, architecture patterns
- [Claude Code in Action](https://anthropic.skilljar.com/claude-code-in-action) — dev workflows, CI/CD
- [Introduction to MCP](https://anthropic.skilljar.com/) — MCP fundamentals

**Documentation**:
- [Anthropic API Docs](https://docs.anthropic.com/)
- [Claude Code Docs](https://docs.anthropic.com/en/docs/claude-code/overview)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Anthropic Courses (GitHub)](https://github.com/anthropics/courses)

**Exam**:
- [Register for the Exam](https://anthropic.skilljar.com/claude-certified-architect-foundations-access-request)
- [Exam Guide PDF](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F8lsy243ftffjjy1cx9lm3o2bw%2Fpublic%2F1773274827%2FClaude+Certified+Architect+%E2%80%93+Foundations+Certification+Exam+Guide.pdf)
- [Claude Partner Network](https://claude.com/partners) — free membership, first 5,000 get free exam access

## Tech stack

- React + Vite (frontend)
- Express + SQLite (backend — state persistence + AI proxy)
- Claude Sonnet via Anthropic API or AWS Bedrock
- SM-2 algorithm for spaced repetition

## License

MIT
