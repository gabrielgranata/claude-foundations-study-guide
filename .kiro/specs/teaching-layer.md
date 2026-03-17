# Spec: Integrated Teaching Layer for CCA Study Guide

## Problem

The tool has a Socratic scaffold (TENSION → PATTERN → INTEGRATION) but no ENCOUNTER phase. There's no reference material, no way to explore concepts before being tested on them. A learner who doesn't know what a coordinator-subagent pattern is gets thrown into a scenario cold and has nowhere to go.

The formation cycle from the talk requires encounter with the material FIRST. The Inquizzitor research (Cohn et al., 2025) confirms this: effective scaffolding requires an assessment module (where is the learner?) feeding an adaptive decision module (what support do they need?). We have the adaptive module. We're missing the assessment and the encounter.

## Design Principles

From the talk's framework:
- **Scaffold, not shortcut**: Reference material teaches through guided exploration, not dumps of information
- **Progressive disclosure**: Concepts reveal depth as the learner demonstrates readiness
- **The formation cycle drives everything**: ENCOUNTER (meet the material) → TENSION (probe understanding) → PATTERN (name what emerged) → INTEGRATION (articulate in own words)

From Inquizzitor/ZPD research:
- **Adaptive scaffolding fades as competence grows** — more support for UNSEEN/ENCOUNTER, less for PATTERN/INTEGRATION
- **Assessment is continuous** — every interaction updates the learner model
- **Goal setting matters** — learners need to know what they're working toward

## Architecture

### 1. Rich concept content in knowledge.js

Each concept gets expanded from a one-liner to a structured teaching object:

```js
'1.2': {
  id: '1.2',
  domainId: 1,
  description: 'Coordinator-subagent pattern and delegation design',
  // NEW FIELDS:
  teach: {
    // What this concept IS — 2-3 paragraphs, concrete
    explanation: `The coordinator-subagent pattern splits a complex task...`,
    // A minimal code example showing the pattern correctly
    codeExample: `coordinator = Agent(tools=[delegate_to_research, delegate_to_writer])...`,
    // What goes wrong without this — makes the concept feel necessary
    whyItMatters: `Without delegation, a single agent with 15+ tools...`,
    // Links to official Anthropic docs
    references: [
      { title: 'Building Agents - Anthropic Docs', url: 'https://docs.anthropic.com/...' }
    ],
    // Concepts that should be understood first
    prerequisites: ['1.1', '1.9'],
    // Concepts this connects to
    relatedConcepts: ['2.3', '1.3', '1.4'],
  }
}
```

### 2. New "Learn" view — the encounter phase

A new view accessible from the sidebar: **Learn** (between Dashboard and Study Domain).

When you pick a domain, you see all its concepts as expandable cards. Each card shows:
- The concept description (always visible)
- Stage indicator (UNSEEN → INTEGRATION)
- Expand to reveal: explanation, code example, why it matters, references, related concepts

Reading a concept (expanding it) moves it from UNSEEN → ENCOUNTER automatically. This IS the encounter — meeting the material.

At the bottom of each expanded concept: a "Test my understanding" button that launches a focused Socratic mini-session on just that concept (3-5 turns, tight).

### 3. Adaptive study sessions — the AI knows what you've read

When entering a Study Domain session, the system prompt now includes the learner's current state:

```
STUDENT'S CURRENT STATE FOR THIS DOMAIN:
- 1.1 Agentic loop structure: INTEGRATION (solid understanding)
- 1.2 Coordinator-subagent pattern: ENCOUNTER (has read material, not yet tested)
- 1.3 Session state management: UNSEEN (hasn't encountered yet)

ADAPTIVE RULES:
- For UNSEEN concepts: Don't test them. If the scenario touches them, briefly introduce the concept and suggest the student read about it in the Learn view.
- For ENCOUNTER concepts: These are your primary targets. Create scenarios that probe whether reading translated to understanding.
- For TENSION concepts: Push deeper. They've been tested but haven't demonstrated the mechanism yet.
- For PATTERN/INTEGRATION concepts: Use these as building blocks. Reference them as known, connect new concepts to them.
```

This is the ZPD implementation — the AI adapts its scaffolding level based on where the learner actually is.

### 4. Concept connections visible during sessions

The session sidebar already shows concept stages. Enhance it:
- Show prerequisite relationships (arrows or indentation)
- When the AI references a concept during conversation, highlight it in the sidebar
- Show "suggested next" concepts based on what's been integrated

### 5. Updated system prompts

The study prompt gets a new section injected dynamically:

```js
function getStudyPrompt(domain, conceptStates) {
  const stateBlock = domain.conceptIds.map(id => {
    const state = conceptStates[id];
    const concept = CONCEPTS[id];
    return `- ${id} ${concept.description}: ${state.stage}`;
  }).join('\n');

  return `...existing prompt...

STUDENT'S CURRENT UNDERSTANDING:
${stateBlock}

ADAPTIVE SCAFFOLDING RULES:
- Target concepts at ENCOUNTER or TENSION stage — these are in the student's zone of proximal development.
- For UNSEEN concepts: mention them only if the scenario naturally requires it. Suggest the student explore them in the Learn view first.
- For PATTERN/INTEGRATION concepts: treat as known. Build on them. Connect new concepts to them.
- Adjust your scaffolding intensity: more support (hints, leading questions) for ENCOUNTER. Less support (open-ended probes) for TENSION. Minimal support for PATTERN.
- When a student demonstrates genuine understanding of a concept's mechanism, tell them explicitly: "Your understanding of [concept] seems solid — I'd suggest advancing it to PATTERN."
`;
}
```

## Implementation Plan

### Files to modify:
1. `src/data/knowledge.js` — Expand all 44 concepts with teach content
2. `src/components/LearnView.jsx` — New component: browsable concept explorer
3. `src/components/Sidebar.jsx` — Add Learn nav item
4. `src/App.jsx` — Route to LearnView
5. `src/lib/prompts.js` — Update getStudyPrompt to accept and inject concept states
6. `src/components/StudyDomain.jsx` — Pass concept states to prompt builder
7. `src/components/ScenarioDeepDive.jsx` — Same
8. `src/components/ConceptBadge.jsx` — Add prerequisite/connection display

### What NOT to build:
- No automated stage advancement from AI responses (keep it manual/post-session — the learner should own their assessment)
- No quiz mode (that's a shortcut, not a scaffold)
- No gamification (badges, streaks — these optimize for engagement, not understanding)

## Success criteria
- A learner can sit down with zero Claude architecture knowledge, browse Domain 1 in Learn view, read through concepts, then enter a Study session where the AI adapts to what they've read
- The AI never tests them on concepts they haven't encountered
- The progression feels natural: read → get probed → identify gaps → read more → get probed deeper
