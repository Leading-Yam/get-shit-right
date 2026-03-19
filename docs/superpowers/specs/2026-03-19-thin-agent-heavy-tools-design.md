# Thin Agent, Heavy Tools: Agent Architecture Redesign

## Problem

GSR agents currently bundle judgment, format rules, validation logic, tool routing, and reasoning guidance into single monolithic prompts. This kills adaptability — the LLM follows rigid scripts instead of reasoning through evidence. Hardcoded scoring thresholds, auto-KILL gates, citation templates, and search budgets constrain agents into pattern-following rather than problem-solving.

## Philosophy

From the "thin agent, heavy tools" principle:

- **Agents think.** They reason freely within their domain perspective. No format templates, no checklists, no deterministic gates.
- **Validators check.** They enforce correctness after the agent produces output. Hard constraints use feedback loops. Soft constraints surface as flags.
- **Memory compounds.** Agents learn from past runs. A 3-layer memory system (working/project/global) stores insights and failures. Agents get better with every validation.

## Architecture

```
Workflows (orchestrate)
  ├── Memory Read (retrieve relevant learnings)
  ├── Agent Execute (reason freely, produce output)
  ├── Validator Run (check output quality)
  │   ├── Hard: feedback loop → agent retries (max 2)
  │   └── Soft: annotate flags → pass through
  └── Memory Write (store new learnings)
```

Agents never call validators or memory directly. Workflows handle all plumbing.

---

## Layer 1: Agent Redesign

### Principle

Agent prompts become pure reasoning briefs: who you are, what to think about, what perspective to bring. No format templates, no citation checklists, no search budgets, no self-review steps, no tool fallback logic.

### Changes Per Agent

**gsr-interviewer** — Minimal change. Already reasoning-driven. Remove output format template (moves to validator). Keep adaptive questioning behavior.

**gsr-researcher** — Keep skeptical investigator identity and platform-aware research approach. Remove search budgets, evidence citation format, self-review checklist, Firecrawl fallback logic. Workflow injects tool routing and memory context.

**gsr-competitor-analyst** — Keep gap-finding perspective and both modes (standard/deep). Remove citation format, search budgets, self-review, tool fallback logic. Workflow injects tool routing and memory context.

**gsr-market-sizer** — Keep conservative estimator identity and "show the math" principle. Remove citation format, search budgets, self-review, tool fallback logic, confidence calibration rules.

**gsr-judge** — Biggest change. Keep default-kill stance and 7 dimensions as analytical lenses. Remove rigid 1-5 rubric descriptions, auto-KILL triggers (becomes a validator signal), calibration table (becomes advisory reference injected by workflow), verdict templates, output format. Add freedom to weight dimensions differently, argue compensating strengths, and override thresholds with explicit reasoning.

**gsr-value-skewer** — Keep DeMarco's Value Array as analytical lens and leverage-oriented thinking. Remove rigid CENTS verdict categories, prescribed step sequence, citation format, self-review. Add freedom to identify skew opportunities beyond the 5 axes.

### Tool Fallback Logic

Currently duplicated across 4 agents (~15 lines each). Moves entirely to workflow layer. Workflow detects available tools once, injects tool context into all agent prompts.

### Expected Result

Agent prompts shrink 40-60%. Agents become more adaptive, handle edge cases better, and produce more nuanced analysis.

---

## Layer 2: Validator Layer

### Directory Structure

New `validators/` directory at project root.

### Hard Validators (feedback loop)

**evidence-integrity.md**
- Checks: every factual claim has a source URL. Claims without sources tagged `[UNVERIFIED]`.
- Fails if: >30% of claims are unverified.
- Applies to: researcher, competitor-analyst, market-sizer, judge.

**output-structure.md**
- Checks: output is parseable, contains required sections for the target template, no missing headers.
- Pure format check — no judgment on content quality.
- Applies to: all agents.

### Soft Validators (flag and surface)

**research-coverage.md**
- Checks: platform breadth, search diversity, gap identification.
- Flags: "Only 1 platform searched", "No Reddit coverage", etc.
- Applies to: researcher, competitor-analyst, market-sizer.

**scoring-integrity.md**
- Checks: each score has supporting evidence. Detects auto-KILL conditions (Pain=1 or WTP=1).
- Surfaces auto-KILL as a signal to the judge, not an override. Judge can acknowledge and still reason through it.
- Applies to: judge.

**confidence-calibration.md**
- Checks: confidence labels (High/Medium/Low) match evidence backing.
- Flags: "High confidence claimed with only 1 source."
- Applies to: all research agents.

### Validator Behavior

- Validators never modify agent output. They return PASS/FAIL/FLAG + specific issues.
- Validators are stateless. Read output, check, return findings.
- Validators are composable. Workflows pick which validators apply to which agent.
- Hard vs. soft classification is configured in the workflow, not the validator. Same validator can be hard for one agent and soft for another.

### Validation Flow

```
Agent output
  → Hard validators (sequential)
    → PASS: continue
    → FAIL: return issues to agent, retry (max 2)
    → Still fails after 2: surface to founder with warnings
  → Soft validators (parallel)
    → Flags annotated on output
  → Output finalized → written to .validation/
```

---

## Layer 3: Memory Layer

### Implementation

Uses MCP Memory Server (`mcp__memory__*` tools). No external dependencies.

### Entity Schema

```
Entity name: "learning:{agent}:{topic}:{short-hash}"
Entity type: "gsr-learning"

Observations:
- layer: "global" | "project"
- agent: "researcher" | "competitor-analyst" | "market-sizer" | "judge" | "value-skewer"
- category: "platform-insight" | "tool-reliability" | "research-tactic" | "failure-mode" | "success-pattern"
- signal: one-sentence learning
- evidence: one-sentence trigger
- strength: "strong" | "moderate" | "weak"
- project: project identifier (null for global)
- created: ISO date
- last_confirmed: ISO date
```

### Relations

```
learning --derived_from--> learning   (project insight generalized to global)
learning --contradicts--> learning    (new evidence conflicts with old)
learning --supersedes--> learning     (learning updated/refined)
```

### 3-Layer Structure

**Layer 1: Working Memory (session)** — Natural conversation context. IDEA.md contents, agent outputs, validator feedback. Not persisted. Zero overhead.

**Layer 2: Project Memory** — Tagged with `project: "{idea-name}"`. Written after each validation step. Examples: "Reddit r/productivity had 12 threads about AI scheduling pain", "Calendly dominates but lacks team-async". Read at the start of any re-run. Lives as long as the validation.

**Layer 3: Global Memory** — Tagged with `project: null`. Written when a pattern is observed across 2+ projects. Examples: "Indie Hackers search indexing unreliable", "B2B pricing rarely on G2, check pricing pages directly". Read before every agent execution. Persistent across all projects.

### Token Efficiency

- Retrieval via `mcp__memory__search_nodes` with targeted queries — not bulk reads.
- Cap at 5 learnings per agent invocation, sorted by strength + recency.
- Learnings are terse: one-sentence signal, one-sentence evidence.
- Global learnings are high-value, low-volume (require 2+ confirmations to be created).

### Promotion Logic

```
Project learning observed once → stays project
Project learning confirmed 2x across different projects → promoted to global
Global learning contradicted by new evidence → weakened (strength → "weak")
Global learning not confirmed in 10+ runs → eligible for pruning
```

---

## Layer 4: Workflow Changes

### Tool Routing (new Step 0)

Extracted from all agents. Workflows detect available tools once at the start:

```
Probe Firecrawl → set tool_context
Inject tool_context into all agent prompts for this run
```

### research.md

1. Check prerequisites
2. Detect tools → set tool_context
3. Read memory (global + project learnings per agent)
4. Spawn 3 agents in parallel (with tool_context + memory injected)
5. Validate each agent output:
   - evidence-integrity (hard) → retry loop
   - research-coverage (soft) → annotate
   - confidence-calibration (soft) → annotate
6. Smart merge (existing logic)
7. Write memory (platform insights, recurring patterns)
8. Display results with flags

### score.md

1. Check prerequisites
2. Read memory (global + project learnings for judge)
3. Inject scoring framework as advisory reference
4. Dispatch judge (with memory + advisory framework)
5. Validate:
   - evidence-integrity (hard) → retry
   - scoring-integrity (soft) → flag, surface auto-KILL signals
6. Write memory
7. Display results with flags

### decide.md

1. Check prerequisites
2. Read all artifacts
3. Read memory (global + project)
4. Produce verdict via reasoned judgment — thresholds are advisory, judge can override with reasoning ("Score is 22/35 but I recommend BUILD because...")
5. Validate:
   - output-structure (hard) → required sections
   - evidence-integrity (soft) → flag but don't block reasoning-heavy verdicts
6. Write memory
7. GSD handoff (unchanged)

### skew.md and reverse.md

Same pattern: add memory read before agent, validation after agent, memory write after validation.

### Principle

Workflows grow, agents shrink. Orchestration logic scattered across agent prompts consolidates into workflows. Agents become 40-60% shorter. Workflows gain ~15-20 lines each.

---

## New File Structure

```
agents/
  gsr-interviewer.md      (minor trim)
  gsr-researcher.md       (major simplification)
  gsr-competitor-analyst.md (major simplification)
  gsr-market-sizer.md     (major simplification)
  gsr-judge.md            (rewritten — reasoning-first)
  gsr-value-skewer.md     (simplified)

validators/
  evidence-integrity.md   (new)
  output-structure.md     (new)
  research-coverage.md    (new)
  scoring-integrity.md    (new)
  confidence-calibration.md (new)

memory/
  schema.md               (entity schema + relations)
  operations.md           (read/write patterns for workflows)

workflows/
  research.md             (updated — memory + validation steps)
  score.md                (updated — advisory scoring + validation)
  decide.md               (updated — reasoned verdicts)
  skew.md                 (updated — memory + validation)
  reverse.md              (updated — memory + validation)
  idea.md                 (minimal change)
  state.md                (unchanged)
  help.md                 (updated — document new architecture)
  quick.md                (updated — inherits workflow changes)
```

---

## What Stays the Same

- Command definitions (`commands/val/*.md`) — they delegate to workflows, no structural change needed.
- Templates (`templates/`) — output format references remain for validators to check against.
- State management (`workflows/state.md`) — unchanged.
- `.validation/` directory structure — same artifacts, same filenames.
- Distribution (npm, hooks, update mechanism) — unchanged.

## What Changes

- Agent prompts: rewritten to pure reasoning briefs.
- Workflows: gain memory read/write and validation orchestration steps.
- New `validators/` directory with 5 validator specs.
- New `memory/` directory with schema and operation patterns.
- Scoring thresholds become advisory, not deterministic.
- Tool fallback logic centralized in workflows.

## Risks

- **Agent output quality without rigid prompts.** Mitigated by the validator feedback loop — agents that produce poor output get specific correction signals.
- **Memory bloat over many runs.** Mitigated by the 5-learning cap per invocation and the pruning logic for stale global learnings.
- **Validator overhead adding latency.** Mitigated by running soft validators in parallel and keeping hard validators focused (2 max).
- **Migration complexity.** Every agent and workflow file changes. Requires careful sequencing — agents first, then validators, then workflow integration, then memory.
