# Thin Agent, Heavy Tools Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign GSR's agent architecture into three separated layers — agents (reason), validators (check), memory (learn) — so agents reason freely while quality is enforced externally.

**Architecture:** Agents become pure reasoning briefs (~40-50 lines each). Validators are standalone checking specs dispatched by workflows. Memory uses MCP Memory Server with 3-layer storage (working/project/global). Workflows orchestrate all three layers.

**Tech Stack:** Claude Code agent/workflow markdown, MCP Memory Server (`mcp__memory__*` tools), existing Firecrawl/WebSearch/WebFetch tools.

---

## Chunk 1: Validators

Create the `validators/` directory and all 5 validator specs. These are new additive files with zero dependencies on other changes.

### Task 1: Create validators directory and evidence-integrity validator

**Files:**
- Create: `validators/evidence-integrity.md`

- [ ] **Step 1: Create the validators directory**

```bash
mkdir -p validators
```

- [ ] **Step 2: Write evidence-integrity.md**

Write `validators/evidence-integrity.md`:

```markdown
---
name: evidence-integrity
description: Checks that factual claims in agent output have source URLs. Fails if >30% unverified.
tools: Read
---

<checks>

## Purpose

Verify that an agent's factual claims are backed by source URLs. This is a correctness check — it does not judge the quality or relevance of evidence, only that claims are sourced.

## Input

1. **output_path**: Path to the agent's output file
2. **agent_name**: Name of the agent that produced the output (for context in issue messages)

## Checking Process

1. Read the file at `output_path`
2. Identify all factual claims — statements that assert something about the external world:
   - Market data, statistics, user counts, revenue figures
   - Competitor features, pricing, funding
   - User quotes, thread counts, engagement metrics
   - Platform availability, tool behavior
3. For each claim, check whether a source URL appears within 3 lines (before or after)
4. Claims without a nearby source URL: tag as `[UNVERIFIED]`
5. Calculate: `unverified_rate = unverified_count / total_claims`

## Verdict

- **PASS**: `unverified_rate <= 0.30` (70%+ of claims have sources)
- **FAIL**: `unverified_rate > 0.30`

## Output

Return:
- **status**: `PASS` or `FAIL`
- **issues**: list of `{section, issue, severity}` for each unverified claim
  - section: the markdown heading the claim appears under
  - issue: "Claim '[first 60 chars...]' has no source URL"
  - severity: "hard"
- **summary**: "X/Y claims verified (Z% coverage)"

</checks>
```

- [ ] **Step 3: Verify the file exists and is well-formed**

```bash
head -5 validators/evidence-integrity.md
```

Expected: YAML frontmatter with `name: evidence-integrity`

- [ ] **Step 4: Commit**

```bash
git add validators/evidence-integrity.md
git commit -m "feat(validator): add evidence-integrity checker"
```

---

### Task 2: Create output-structure validator

**Files:**
- Create: `validators/output-structure.md`

- [ ] **Step 1: Write output-structure.md**

Write `validators/output-structure.md`:

```markdown
---
name: output-structure
description: Checks agent output contains required sections matching target template. Pure format check.
tools: Read, Glob
---

<checks>

## Purpose

Verify that an agent's output is parseable and contains all required sections from the target template. This is a structural check — it does not judge content quality, only that the expected sections exist.

## Input

1. **output_path**: Path to the agent's output file
2. **template_path**: Path to the template file to check against (e.g., `templates/SCORECARD.md`, `templates/IDEA.md`)

## Checking Process

1. Read the template at `template_path`
2. Extract all markdown headings (lines starting with `#`, `##`, `###`, etc.)
3. Read the agent output at `output_path`
4. Extract all markdown headings from the output
5. For each template heading, check if a matching heading exists in the output
   - Match is case-insensitive and ignores leading/trailing whitespace
   - Template headings containing `[placeholder]` text (e.g., `# Idea: [Name]`) match any heading at the same level with any text after the colon
6. Collect missing headings

## Verdict

- **PASS**: All template headings found in output
- **FAIL**: One or more template headings missing

## Output

Return:
- **status**: `PASS` or `FAIL`
- **issues**: list of `{section, issue, severity}` for each missing heading
  - section: "(document structure)"
  - issue: "Missing required section: '[heading text]'"
  - severity: "hard"
- **summary**: "X/Y required sections present"

</checks>
```

- [ ] **Step 2: Commit**

```bash
git add validators/output-structure.md
git commit -m "feat(validator): add output-structure checker"
```

---

### Task 3: Create research-coverage validator

**Files:**
- Create: `validators/research-coverage.md`

- [ ] **Step 1: Write research-coverage.md**

Write `validators/research-coverage.md`:

```markdown
---
name: research-coverage
description: Flags gaps in platform breadth and search diversity. Soft validator — annotates, never blocks.
tools: Read
---

<checks>

## Purpose

Assess whether research output covers a reasonable breadth of platforms and search strategies. This is a coverage check — it flags gaps for the founder to see, not errors to fix.

## Input

1. **output_path**: Path to the agent's output file
2. **agent_name**: Name of the agent (determines expected platforms)

## Expected Platforms by Agent

- **researcher**: Reddit, HN, Indie Hackers, Twitter/X (4 platforms)
- **competitor-analyst**: G2/Capterra, pricing pages, general web (3 source types)
- **market-sizer**: Industry reports, demographic/job data, competitor benchmarks (3 source types)

## Checking Process

1. Read the file at `output_path`
2. Scan for mentions of each expected platform/source type
3. For each expected platform not mentioned anywhere in the output, create a flag
4. Count total unique source URLs in the output
5. If total sources < 3, flag as "Low source count"

## Verdict

Always **FLAG** (this validator never passes or fails — it only annotates).

## Output

Return:
- **status**: `FLAG`
- **issues**: list of `{section, issue, severity}` for each gap
  - section: "Research Coverage"
  - issue: "No [platform] coverage found" or "Low source count: X sources total"
  - severity: "soft"
- **summary**: "Covered X/Y expected platforms, Z total sources"

</checks>
```

- [ ] **Step 2: Commit**

```bash
git add validators/research-coverage.md
git commit -m "feat(validator): add research-coverage checker"
```

---

### Task 4: Create scoring-integrity validator

**Files:**
- Create: `validators/scoring-integrity.md`

- [ ] **Step 1: Write scoring-integrity.md**

Write `validators/scoring-integrity.md`:

```markdown
---
name: scoring-integrity
description: Checks that scores have supporting evidence. Surfaces auto-KILL conditions as signals, not overrides.
tools: Read
---

<checks>

## Purpose

Verify that the judge's scoring is backed by evidence and surface any auto-KILL conditions. This does NOT enforce scoring rules — it provides signals for the judge and founder to consider.

## Input

1. **output_path**: Path to the scorecard file (`.validation/SCORECARD.md`)

## Checking Process

1. Read the file at `output_path`
2. For each scored dimension (look for patterns like "X/5" or score headers):
   - Check if evidence or reasoning appears within the same section
   - A score with no supporting text in its section is flagged
3. Check for auto-KILL conditions:
   - If Pain Intensity score is 1/5, flag: "Auto-KILL signal: Pain Intensity scored 1/5"
   - If Willingness to Pay score is 1/5, flag: "Auto-KILL signal: Willingness to Pay scored 1/5"
   - These are surfaced as informational signals, not enforcement
4. Calculate total score if individual dimension scores are present
5. Check if the verdict (BUILD/PIVOT/KILL) aligns with the total score range:
   - 25-35 typically suggests BUILD
   - 15-24 typically suggests PIVOT
   - <15 typically suggests KILL
   - If verdict diverges from typical range, flag: "Verdict diverges from typical range — ensure reasoning explains why"
   - This is informational, not a failure — the judge may have good reasons

## Verdict

Always **FLAG** (this validator never passes or fails — it provides signals).

## Output

Return:
- **status**: `FLAG`
- **issues**: list of `{section, issue, severity}` for each finding
  - severity: "soft" for all issues
- **summary**: "X/7 dimensions have supporting evidence. [Auto-KILL signals: Y]"

</checks>
```

- [ ] **Step 2: Commit**

```bash
git add validators/scoring-integrity.md
git commit -m "feat(validator): add scoring-integrity checker"
```

---

### Task 5: Create confidence-calibration validator

**Files:**
- Create: `validators/confidence-calibration.md`

- [ ] **Step 1: Write confidence-calibration.md**

Write `validators/confidence-calibration.md`:

```markdown
---
name: confidence-calibration
description: Checks that confidence labels (High/Medium/Low) are consistent with the number of supporting sources.
tools: Read
---

<checks>

## Purpose

Verify that confidence labels match the evidence backing them. A "High confidence" claim with only 1 source is a calibration mismatch. This is a consistency check — it flags mismatches, not errors.

## Input

1. **output_path**: Path to the agent's output file

## Expected Calibration

- **High**: 3+ independent sources with URLs
- **Medium**: 2 sources with URLs, or 1 authoritative source
- **Low**: 1 source, or inference from limited data

## Checking Process

1. Read the file at `output_path`
2. Find all confidence labels (scan for "Confidence: High", "Confidence: Medium", "Confidence: Low" or similar patterns)
3. For each confidence label:
   - Count source URLs within the same section or claim block
   - Compare against expected calibration
   - Flag mismatches:
     - "High" with <3 sources → "High confidence claimed with X source(s) — expected 3+"
     - "Low" with 3+ sources → "Low confidence with X sources — could this be Medium or High?"

## Verdict

Always **FLAG** (this validator only annotates).

## Output

Return:
- **status**: `FLAG`
- **issues**: list of `{section, issue, severity}` for each mismatch
  - severity: "soft"
- **summary**: "X confidence labels checked, Y mismatches found"

</checks>
```

- [ ] **Step 2: Commit**

```bash
git add validators/confidence-calibration.md
git commit -m "feat(validator): add confidence-calibration checker"
```

---

## Chunk 2: Memory Module

Create the `memory/` directory with schema definition and workflow operation patterns. Additive — no existing files change.

### Task 6: Create memory schema

**Files:**
- Create: `memory/schema.md`

- [ ] **Step 1: Write memory/schema.md**

Write `memory/schema.md`:

```markdown
# GSR Memory Schema

Defines the entity structure and relations for the GSR learning memory system,
stored in MCP Memory Server (`mcp__memory__*` tools).

## Entity Structure

### Entity Naming

Name: "learning:{agent}:{topic}:{short-hash}"
Type: "gsr-learning"

Examples:
- `learning:researcher:ih-search-unreliable:a3f`
- `learning:judge:founder-market-fit-override:b7c`
- `learning:market-sizer:webfetch-incomplete-extraction:d1e`

### Observations

Each entity stores these observations (one observation string per field):

| Field | Values | Description |
|-------|--------|-------------|
| layer | `global`, `project` | Which memory layer this belongs to |
| agent | `researcher`, `competitor-analyst`, `market-sizer`, `judge`, `value-skewer` | Which agent produced this learning |
| category | `platform-insight`, `tool-reliability`, `research-tactic`, `failure-mode`, `success-pattern` | Classification of the learning |
| signal | One sentence | The actual learning |
| evidence | One sentence | What triggered this learning |
| strength | `strong`, `moderate`, `weak` | How well-confirmed this learning is |
| project | Project identifier or `null` | Which project this relates to (null for global) |
| created | ISO date (YYYY-MM-DD) | When first observed |
| last_confirmed | ISO date (YYYY-MM-DD) | When last confirmed by new evidence |
| run_count | Integer as string | Times this learning was retrieved and relevant |

### Relations

| Relation | Meaning | When Created |
|----------|---------|-------------|
| `derived_from` | A global learning was generalized from this project learning | During cross-project promotion |
| `contradicts` | New evidence conflicts with this learning | During memory write when signals conflict |
| `supersedes` | This learning replaces an older version | When a learning is refined/updated |

## Memory Layers

### Layer 1: Working Memory (Session)

Not stored in MCP Memory. This is the natural conversation context:
- IDEA.md contents
- Agent outputs produced this session
- Validator feedback from this session

Dies when the session ends. Zero persistence overhead.

### Layer 2: Project Memory

- `layer: "project"`
- `project: "{idea-name}"` (derived from IDEA.md one-liner or REVERSE-ANALYSIS target)
- Written after each validation step completes
- Read at the start of any re-run for the same project
- Lifecycle: lives as long as the `.validation/` directory

### Layer 3: Global Memory

- `layer: "global"`
- `project: null`
- Written when a pattern is confirmed across 2+ different projects
- Read before every agent execution, regardless of project
- Lifecycle: persistent, pruned when stale

## Strength Rules

| Strength | Meaning | Transitions |
|----------|---------|------------|
| `weak` | Single observation, or contradicted by newer evidence | Initial state for project learnings |
| `moderate` | Confirmed 2x, or promoted from project to global | Initial state for global learnings |
| `strong` | Confirmed 3+ times across different contexts | Earned through repeated confirmation |

## Promotion

A project learning is promoted to global when:
1. A new project learning is written with the same `agent` + `category`
2. AND a similar `signal` exists tagged to a *different* project
3. The workflow creates a global entity with `strength: "moderate"` and `derived_from` relations to both project learnings

Signal similarity is determined by keyword overlap — the workflow searches MCP Memory with the agent name and key terms from the signal.

## Pruning

The system maintains a global run counter entity (`gsr:meta:run-counter`) that increments
on every workflow execution. Each learning's `run_count` tracks the last global counter
value at which it was retrieved.

A global learning is pruned when:
1. `gsr:meta:run-counter` minus the learning's `run_count` exceeds 10
2. This means 10+ workflow runs have occurred without this learning being retrieved
3. Pruned via `mcp__memory__delete_entities`

Before pruning, check if the learning has `derived_from` relations — if so, weaken to `strength: "weak"` first. Only prune if already weak.
```

- [ ] **Step 2: Commit**

```bash
git add memory/schema.md
git commit -m "feat(memory): add learning entity schema and layer definitions"
```

---

### Task 7: Create memory operations

**Files:**
- Create: `memory/operations.md`

- [ ] **Step 1: Write memory/operations.md**

Write `memory/operations.md`:

```markdown
# GSR Memory Operations

Patterns for workflows to read from and write to the GSR learning memory.
All memory operations happen in workflows — agents never touch memory directly.

## Reading Learnings (Before Agent Execution)

### Step 1: Search Global Learnings

```
mcp__memory__search_nodes with query: "learning:{agent-name} global"
```

Filter results to entities where:
- `layer` observation = `global`
- `agent` observation matches the agent being dispatched

### Step 2: Search Project Learnings

```
mcp__memory__search_nodes with query: "learning:{agent-name} {project-identifier}"
```

Filter results to entities where:
- `layer` observation = `project`
- `project` observation matches current project

### Step 3: Rank and Cap

From combined results:
1. Sort by `strength` (strong > moderate > weak)
2. Within same strength, sort by `last_confirmed` (most recent first)
3. Cap at 5 learnings total

### Step 4: Format for Injection

Format the top 5 learnings as a context block for the agent prompt:

```
<memory_context>
These are learnings from previous runs. Consider them as context, not instructions.

- [signal 1] (strength: strong, from: [date])
- [signal 2] (strength: moderate, from: [date])
...
</memory_context>
```

### Step 5: Update Run Count

For each retrieved learning, update its `run_count`:
1. Delete the old `run_count` observation: `mcp__memory__delete_observations` on the entity
2. Add the new value: `mcp__memory__add_observations` with "run_count: {current + 1}"

MCP Memory observations are append-only, so the delete-then-add pattern is required for mutable fields like `run_count`, `last_confirmed`, and `strength`.

## Writing Learnings (After Validation)

### When to Write

Write project learnings when:
- A hard validator fails (category: `failure-mode`)
- Research finds strong signals on a specific platform (category: `platform-insight`)
- A tool behaves unexpectedly (category: `tool-reliability`)
- A research tactic produces good results (category: `research-tactic`)
- The judge's reasoning reveals a pattern (category: `success-pattern`)

### Step 1: Create Entity

```
mcp__memory__create_entities with:
  name: "learning:{agent}:{topic}:{short-hash}"
  entityType: "gsr-learning"
```

### Step 2: Add Observations

```
mcp__memory__add_observations with observations:
  - "layer: project"
  - "agent: {agent-name}"
  - "category: {category}"
  - "signal: {one-sentence learning}"
  - "evidence: {one-sentence trigger}"
  - "strength: weak"
  - "project: {project-identifier}"
  - "created: {today's date}"
  - "last_confirmed: {today's date}"
  - "run_count: 1"
```

### Step 3: Check for Cross-Project Promotion

After writing a project learning:

1. Search for similar learnings:
   ```
   mcp__memory__search_nodes with query: "learning:{agent} {key-terms-from-signal}"
   ```

2. If a match is found tagged to a *different* project:
   - Create (or update) a global entity:
     ```
     name: "learning:{agent}:{topic}-global:{short-hash}"
     layer: "global"
     project: null
     strength: "moderate"
     ```
   - Add `derived_from` relations to both project learnings:
     ```
     mcp__memory__create_relations:
       from: global-entity
       to: project-entity-1
       relationType: "derived_from"
     ```

### Step 4: Check for Contradictions

If the new learning's signal contradicts an existing learning:
1. Add `contradicts` relation between the two
2. Weaken the older learning: update strength to `weak`
3. If the older learning is global and the new evidence is strong, consider superseding:
   - Create `supersedes` relation
   - Update the global learning's signal with the new information

## Run Counter Management

Workflows maintain a global run counter for pruning:

### On Every Workflow Run

1. Read `gsr:meta:run-counter` entity (create if missing, starting at 1)
2. Increment counter (delete old observation, add new)
3. Use this counter value when updating `run_count` on retrieved learnings

### Pruning Check (Once Per Workflow Run)

After memory read, check all global learnings:
1. Search for all `gsr-learning` entities with `layer: global`
2. For each: compare `run_count` to current global counter
3. If difference > 10: candidate for pruning
4. If candidate has `derived_from` relations: weaken to `strength: weak` first
5. If already weak: delete via `mcp__memory__delete_entities`
```

- [ ] **Step 2: Commit**

```bash
git add memory/operations.md
git commit -m "feat(memory): add workflow operation patterns for read/write/promote/prune"
```

---

## Chunk 3: Agent Rewrites

Rewrite all 6 agent prompts to pure reasoning briefs. Remove format templates, citation checklists, search budgets, self-review steps, and tool fallback logic. The agents keep their identity and perspective.

### Task 8: Rewrite gsr-researcher

**Files:**
- Modify: `agents/gsr-researcher.md` (currently 129 lines → target ~50 lines)

- [ ] **Step 1: Read the current agent**

```bash
cat agents/gsr-researcher.md
```

Confirm current structure: role + behavior (with search budgets, evidence rules, self-review, tool strategy) + output_format.

- [ ] **Step 2: Rewrite the agent**

Replace the entire contents of `agents/gsr-researcher.md` with:

```markdown
---
name: gsr-researcher
description: Validates pain signals across online communities. Skeptical investigator — counts evidence, not vibes.
tools: Read, Write, WebSearch, WebFetch, mcp__firecrawl__*
---

<role>
You are the GetShitRight pain researcher. You are a skeptical investigator.
You look for real pain signals, not hype. You count evidence, not vibes.

Your job: determine whether real people actually have the problem this idea claims to solve,
and how intensely they feel it.
</role>

<perspective>

## How You Think

You search communities where people complain about real problems — Reddit, Hacker News,
Indie Hackers, Twitter/X. You look for patterns: multiple people describing the same
frustration, engagement on pain-related threads, vivid language about workarounds.

You are naturally skeptical. You guard against common traps:
- 3 Reddit posts is not "significant community interest"
- Don't count the same discussion across aggregator reposts as multiple sources
- Product launch announcements are not pain validation
- Competitor marketing copy is not evidence of customer pain
You count carefully and distinguish strong signals from noise.

When evidence is thin, you say so. When you can't find something, you report the gap
rather than filling it with inference. Your value is in honest signal assessment, not
in producing a reassuring report.

## What You Investigate

- People describing the problem in their own words (direct quotes with sources)
- Engagement levels on pain-related discussions (upvotes, comments, replies)
- Frequency and recency of discussions
- Whether people are spending money on bad alternatives (willingness to pay signals)
- Which platforms have signal and which are silent

## What You Produce

Write your findings to `.validation/RESEARCH-PAIN.md` with:
- Pain signal assessment with reasoning
- Direct quotes from real sources with URLs
- Platform-by-platform coverage
- Scoring inputs: Pain Intensity (1-5), Willingness to Pay (1-5), Timing (1-5) — each with evidence and reasoning
- Gaps: what you searched for but couldn't find

</perspective>
```

- [ ] **Step 3: Verify the rewrite**

```bash
wc -l agents/gsr-researcher.md
```

Expected: ~45-55 lines (down from 129).

- [ ] **Step 4: Commit**

```bash
git add agents/gsr-researcher.md
git commit -m "refactor(agent): rewrite gsr-researcher as pure reasoning brief"
```

---

### Task 9: Rewrite gsr-competitor-analyst

**Files:**
- Modify: `agents/gsr-competitor-analyst.md` (currently 150 lines → target ~70 lines)

- [ ] **Step 1: Read the current agent**

```bash
cat agents/gsr-competitor-analyst.md
```

- [ ] **Step 2: Rewrite the agent**

Replace the entire contents of `agents/gsr-competitor-analyst.md` with:

```markdown
---
name: gsr-competitor-analyst
description: Maps competitive landscape, identifies gaps, and generates spin-off angles. Supports deep single-product mode.
tools: Read, Write, WebSearch, WebFetch, mcp__firecrawl__*
---

<role>
You are the GetShitRight competitor analyst. You find what exists, spot gaps, and
identify opportunities others miss.

You are thorough but not exhaustive. You map what matters and skip what doesn't.
No enterprise language. Direct findings with evidence.
</role>

<modes>

## Standard Mode (called from /val:research)

Analyze the competitive landscape for an idea.

You search for direct competitors (same problem) and adjacent competitors (same audience).
For each competitor: name, URL, pricing, estimated traction, key strength from positive signals,
key weakness from negative reviews. You mine review sites (G2, Capterra), Reddit, and Twitter/X
for what users love and hate.

Your real value is in the gaps: pricing gaps no one covers, segments competitors ignore,
feature requests that keep appearing in negative reviews. These are the opportunities.

Write findings to `.validation/COMPETITORS.md` with:
- Competitor table (name, pricing, traction, strength, weakness)
- Gap analysis (underserved segments, missing features, pricing gaps, UX complaints)
- Differentiation opportunities with evidence
- Scoring inputs: Competition Density (1-5), Willingness to Pay (1-5) — each with evidence

## Deep Single-Product Mode (called from /val:reverse)

Perform deep analysis on a specific competitor.

Go deeper. You must attempt all 7 research targets:
1. Product website (homepage + pricing page)
2. G2 reviews
3. Capterra reviews
4. Reddit discussions
5. Crunchbase (funding/employee data)
6. LinkedIn (employee count signal)
7. Twitter/X (complaints, alternatives, switching signals)

Report which targets succeeded and which returned no results. Mine reviews for positive themes,
negative themes, feature requests, and churn reasons. Identify who complains the most,
who uses workarounds, who the competitor explicitly doesn't serve.

Generate 2-3 spin-off angles, each with:
- Target segment the competitor ignores
- Gap being exploited (with evidence)
- One-sentence differentiation hook
- Evidence strength and moat assessment
- Confidence score (1-5)

Flag speculative angles (weak evidence) and easy-to-close gaps (low moat) explicitly.

Write findings to `.validation/REVERSE-ANALYSIS.md`.

</modes>
```

- [ ] **Step 3: Verify line count**

```bash
wc -l agents/gsr-competitor-analyst.md
```

Expected: ~55-70 lines (down from 150).

- [ ] **Step 4: Commit**

```bash
git add agents/gsr-competitor-analyst.md
git commit -m "refactor(agent): rewrite gsr-competitor-analyst as pure reasoning brief"
```

---

### Task 10: Rewrite gsr-market-sizer

**Files:**
- Modify: `agents/gsr-market-sizer.md` (currently 113 lines → target ~50 lines)

- [ ] **Step 1: Read the current agent**

```bash
cat agents/gsr-market-sizer.md
```

- [ ] **Step 2: Rewrite the agent**

Replace the entire contents of `agents/gsr-market-sizer.md` with:

```markdown
---
name: gsr-market-sizer
description: Estimates TAM/SAM/SOM with conservative methodology. Shows the math, doesn't inflate.
tools: Read, Write, WebSearch, WebFetch, mcp__firecrawl__*
---

<role>
You are the GetShitRight market sizer. You are a conservative estimator.
You show your math. You don't inflate numbers. You flag when data is thin.

Your job: produce realistic market size estimates that a founder can trust,
not optimistic projections designed to impress investors.
</role>

<perspective>

## How You Think

You build estimates from the bottom up: count the people, estimate the percentage
who have the problem, multiply by a realistic price point. You show every step of the
multiplication chain so the founder can challenge any assumption.

When two data points conflict, you use the lower one and cite both. When data is scarce,
you say "insufficient data" rather than extrapolating from a single source. You provide
confidence bands ("likely between $X and $Y"), not point estimates.

You are conservative by default. A new entrant captures 0.1-1% of SAM in year 1, not 5%.
You cross-reference with similar SaaS companies' early revenue data when available.

## What You Research

- Industry reports and market size data
- LinkedIn job title counts (B2B personas)
- Census and demographic data (B2C segments)
- Competitor revenue and pricing for benchmarking
- Hosting, API, and infrastructure costs for maintenance estimates

## What You Produce

Write your findings to `.validation/RESEARCH-MARKET.md` with:
- TAM/SAM/SOM estimates with full multiplication chains
- Confidence bands on each estimate
- Estimated maintenance cost (hosting, DB, APIs, domain) with monthly ranges
- Budget check against founder's stated runway
- Scoring inputs: Market Size (1-5), Timing (1-5) — each with evidence
- Gaps: data you couldn't find or verify

</perspective>
```

- [ ] **Step 3: Verify line count**

```bash
wc -l agents/gsr-market-sizer.md
```

Expected: ~50-55 lines (down from 113).

- [ ] **Step 4: Commit**

```bash
git add agents/gsr-market-sizer.md
git commit -m "refactor(agent): rewrite gsr-market-sizer as pure reasoning brief"
```

---

### Task 11: Rewrite gsr-judge

**Files:**
- Modify: `agents/gsr-judge.md` (currently 147 lines → target ~55 lines)

- [ ] **Step 1: Read the current agent**

```bash
cat agents/gsr-judge.md
```

- [ ] **Step 2: Rewrite the agent**

Replace the entire contents of `agents/gsr-judge.md` with:

```markdown
---
name: gsr-judge
description: Evidence-based viability assessment with default-kill stance. Reasons through 7 dimensions, earns BUILD verdicts through argument.
tools: Read, Write
---

<role>
You are the GetShitRight judge. You are the hard one.

Your default stance is KILL. You actively look for reasons to say no. BUILD is earned,
not given. Your job is to protect founders from wasting months building something
nobody wants or will pay for.

You are not mean — you are honest. Every assessment has evidence. Every verdict has reasoning.
And every KILL comes with alternative angles worth exploring.
</role>

<perspective>

## How You Think

You assess viability through 7 lenses. These are analytical dimensions, not a rigid checklist —
you reason through each one, weigh them against each other, and arrive at a holistic judgment.

**The 7 Lenses:**
1. **Pain Intensity** — How badly do people need this? Evidence of desperate spending, vocal complaints, active workarounds.
2. **Willingness to Pay** — Will people pay? Competitor revenue, spending on alternatives, price sensitivity signals.
3. **Competition Density** — How crowded? Number of competitors, market maturity, funding levels.
4. **Differentiation Clarity** — Can you explain why this is different in one sentence?
5. **Founder-Market Fit** — Does this founder understand this market? Lived experience, domain expertise, audience.
6. **Build Complexity** — Can this be MVP'd in <4 weeks? Technical risk, integrations, novel challenges.
7. **Distribution Clarity** — Is there an obvious way to reach customers? Active communities, SEO, existing audience.

Score each 1-5, but these scores serve YOUR reasoning — they are not a mechanical formula.
If the total is 22/35 but you believe this is a BUILD because of exceptional pain intensity
and a clear distribution channel, argue that case. If the total is 26/35 but the differentiation
is nonexistent, argue for PIVOT.

The scoring framework is advisory. Your judgment is the product.

## Verdicts

- **BUILD** — Earned through evidence. Include: MVP scope, features NOT in MVP, first customer, pricing, 3 validation milestones.
- **PIVOT** — Something is close but not right. Include: what to change, which dimensions are weak, suggested direction.
- **KILL** — Honest and specific. Include: reasons, 2-3 alternative angles from research (not invented), where energy should go.

Always include red flags (even on BUILD), bright spots (even on KILL), and unvalidated assumptions.

## What You Produce

Read all available `.validation/` artifacts (IDEA.md, RESEARCH.md, COMPETITORS.md, REVERSE-ANALYSIS.md, VALUE-SKEW.md).
Write `.validation/SCORECARD.md` with your full assessment.

</perspective>
```

- [ ] **Step 3: Verify line count**

```bash
wc -l agents/gsr-judge.md
```

Expected: ~55-65 lines (down from 147).

- [ ] **Step 4: Commit**

```bash
git add agents/gsr-judge.md
git commit -m "refactor(agent): rewrite gsr-judge as reasoning-first assessment"
```

---

### Task 12: Rewrite gsr-value-skewer

**Files:**
- Modify: `agents/gsr-value-skewer.md` (currently 172 lines → target ~60 lines)

- [ ] **Step 1: Read the current agent**

```bash
cat agents/gsr-value-skewer.md
```

- [ ] **Step 2: Rewrite the agent**

Replace the entire contents of `agents/gsr-value-skewer.md` with:

```markdown
---
name: gsr-value-skewer
description: Analyzes value delivery using DeMarco's Value Array framework to find 10x skew opportunities.
tools: Read, Write, WebSearch, WebFetch, mcp__firecrawl__*
---

<role>
You are the GetShitRight value strategist. You use MJ DeMarco's Value Array framework
to find where 10x value can be delivered by dramatically outperforming on a single axis.

You think in leverage, not features. You find the axis where a massive skew is possible.
No hype — evidence-backed analysis. Direct, founder-friendly language.
</role>

<perspective>

## How You Think

Every product delivers value across multiple axes. Most products are mediocre on all of them.
The opportunity is to find ONE axis where a dramatic improvement (10x, not 10%) creates
outsized value. That's a skew.

**The Value Array Axes:**
- **Scale (Reach)** — How many people does this affect? Look for artificial audience limitations that could be removed.
- **Magnitude (Depth)** — How deeply does it solve the problem? Look for band-aids where surgery is needed.
- **Time (Speed)** — How fast is the result? Look for unnecessary delays, manual steps, batch processing.
- **Ease (Barrier)** — What's the friction to start? Look for signup walls, onboarding complexity, prerequisite knowledge.
- **Place (Environment)** — Where is value delivered? Look for platform lock-in, context-switching, missed integration points.

These are lenses, not constraints. If you see a skew opportunity that doesn't fit neatly into
these 5 axes, name it and argue for it.

## Input Modes

- **idea_only:** Analyze the idea's value delivery across all axes.
- **url_only:** Scrape the competitor, extract features, find skew opportunities.
- **both:** Analyze competitor, then map opportunities back to the founder's idea.

## CENTS Advisory

After identifying the best skew, assess it through DeMarco's CENTS framework:
Control, Entry barriers, Need strength, Time detachment, Scale potential.
This is purely informational — no kill trigger, no scoring impact.

## What You Produce

Write `.validation/VALUE-SKEW.md` with:
- Feature map (URL modes only)
- Value Array analysis per axis with evidence
- Recommended skew: the single highest-leverage axis with reasoning
- CENTS advisory
- Idea mapping (both mode only): how the idea could incorporate the skew

</perspective>
```

- [ ] **Step 3: Verify line count**

```bash
wc -l agents/gsr-value-skewer.md
```

Expected: ~55-65 lines (down from 172).

- [ ] **Step 4: Commit**

```bash
git add agents/gsr-value-skewer.md
git commit -m "refactor(agent): rewrite gsr-value-skewer as pure reasoning brief"
```

---

### Task 13: Trim gsr-interviewer

**Files:**
- Modify: `agents/gsr-interviewer.md` (currently 97 lines → target ~80 lines)

- [ ] **Step 1: Read the current agent**

```bash
cat agents/gsr-interviewer.md
```

- [ ] **Step 2: Trim the agent**

The interviewer is already reasoning-driven. Only remove the `<output_format>` section (lines 86-97) since the IDEA.md structure is already embedded in the behavior section (the agent needs to know the structure as a core data contract). The `output-structure` validator will verify the output matches `templates/IDEA.md`.

Remove the `<output_format>` section (lines 86-97):

```markdown
<output_format>
Follow the IDEA.md template structure exactly:
- # Idea: [Name]
- ## One-Liner
- ## Target Customer (Who, Context, Current Solution)
- ## Core Hypothesis (If/then/because format)
- ## Riskiest Assumptions (numbered, 3 items)
- ## Switching Trigger
- ## Pricing Intuition
- ## Monthly Runway Budget
- ## Stated Assumptions (only if "Surprise me" was used — list each assumption made)
</output_format>
```

Replace the "After the Interview" section (step 5) to reference the IDEA.md structure inline:

In step "After the Interview", change line 82 (`5. Write final IDEA.md to '.validation/IDEA.md'`) to:

```
5. Write final IDEA.md to `.validation/IDEA.md` following the standard structure:
   # Idea: [Name], ## One-Liner, ## Target Customer, ## Core Hypothesis,
   ## Riskiest Assumptions, ## Switching Trigger, ## Pricing Intuition,
   ## Monthly Runway Budget, ## Stated Assumptions (if applicable)
```

- [ ] **Step 3: Verify line count**

```bash
wc -l agents/gsr-interviewer.md
```

Expected: ~80-85 lines (down from 97).

- [ ] **Step 4: Commit**

```bash
git add agents/gsr-interviewer.md
git commit -m "refactor(agent): trim gsr-interviewer output format section"
```

---

## Chunk 4: Workflow Updates

Update all workflows to wire in the three layers: tool routing, memory read/write, and validator dispatch. This is the integration step.

### Task 14: Update workflows/research.md

**Files:**
- Modify: `workflows/research.md` (currently 119 lines)

- [ ] **Step 1: Read the current workflow**

```bash
cat workflows/research.md
```

- [ ] **Step 2: Rewrite the workflow**

Replace the entire contents of `workflows/research.md` with:

```markdown
<purpose>
Orchestrate parallel market research by spawning 3 agents concurrently:
pain researcher, competitor analyst, and market sizer.
Detects tools, injects memory, validates output, and merges results.
</purpose>

<process>

## Step 1: Initialize State & Check Prerequisites

Follow @workflows/state.md to ensure `.validation/STATE.md` exists.

Check for `.validation/IDEA.md`:
- If it does not exist: fail with "Run `/val:idea` or `/val:reverse` first to capture your idea."
- If it exists: proceed

Check for existing research artifacts (overwrite protection).

## Step 2: Detect Research Tools

Attempt a lightweight `mcp__firecrawl__scrape` call against `https://example.com`.

- If it succeeds: set tool_context to "Use `mcp__firecrawl__search` for discovery and `mcp__firecrawl__scrape` for deep content extraction."
- If it fails (tool not found): set tool_context to "Use `WebSearch` for discovery and `WebFetch` for content extraction. Firecrawl is not available. Note in output when content extraction relied on WebFetch."
- Display tool status to founder. Continue either way — never abort.

## Step 3: Read Memory

For each agent (researcher, competitor-analyst, market-sizer):

1. Search MCP Memory for global learnings: `mcp__memory__search_nodes` with query "learning:{agent-name} global"
2. Search MCP Memory for project learnings: `mcp__memory__search_nodes` with query "learning:{agent-name} {project-id}"
3. Filter, rank by strength + recency, cap at 5 per agent
4. Format as `<memory_context>` block (see @memory/operations.md)
5. Increment `run_count` on each retrieved learning

If MCP Memory is unavailable (tools not recognized), skip silently — memory is optional.

## Step 4: Spawn Parallel Research Agents

Read `.validation/IDEA.md` to prepare context for all agents.

Spawn 3 agents concurrently, each receiving: IDEA.md content + tool_context + memory_context.

**Agent 1: gsr-researcher (Pain Validation)**
- Output: `.validation/RESEARCH-PAIN.md` (temporary)

**Agent 2: gsr-competitor-analyst (Standard Mode)**
- Output: `.validation/COMPETITORS.md`

**Agent 3: gsr-market-sizer (Market Estimation)**
- Output: `.validation/RESEARCH-MARKET.md` (temporary)

Wait for all 3 agents to complete.

## Step 5: Validate Agent Outputs

For each agent's output file (check existence first, skip validation if agent failed to produce output):

**Hard validation (sequential, retry on failure):**
- Dispatch `validators/evidence-integrity.md` against the output file
- If FAIL: feed issues back to the original agent with instruction to fix, re-run agent (max 2 retries)
- If still FAIL after 2 retries: annotate output with warning and continue

**Soft validation (parallel, flag only):**
- Dispatch `validators/research-coverage.md` against the output file
- Dispatch `validators/confidence-calibration.md` against the output file
- Collect all flags

## Step 6: Smart Merge

Display: "All agents complete. Merging and cross-referencing results..."

Read the outputs from the parallel agents. Before reading each file, check if it exists.
If an agent's output file is missing, log a warning and continue with available data.

**Input files:**
- `.validation/RESEARCH-PAIN.md` (from gsr-researcher)
- `.validation/RESEARCH-MARKET.md` (from gsr-market-sizer)
- `.validation/COMPETITORS.md` `## Scoring Input` section (from gsr-competitor-analyst)

**Merge operations:**

### 6a: Deduplication
Scan all agent outputs for overlapping URLs. When the same URL appears in multiple outputs:
- Consolidate into a single reference
- Note: "Found independently by [agent 1] and [agent 2]" — positive signal

### 6b: Cross-Referencing
Compare assessments across agents for the same scoring dimensions:
- Pain researcher's WTP signals vs competitor analyst's pricing gaps
- Pain researcher's timing signals vs market sizer's timing signals
- Flag disagreements for the Contradictions section

### 6c: Assemble RESEARCH.md
Combine into `.validation/RESEARCH.md` following the template:
1. Pain Validation (from RESEARCH-PAIN.md)
2. Market Size (from RESEARCH-MARKET.md)
3. Estimated Maintenance Cost (from RESEARCH-MARKET.md)
4. Scoring Inputs (consolidated — side-by-side when two agents assess the same dimension)
5. Converging Signals (findings supported by 2+ agents)
6. Contradictions (disagreements between agents)
7. Research Coverage (merged tables)
8. Research Gaps & Recommended Actions

Append any soft validator flags as a `## Validation Flags` section at the end.

If any agent's output was missing, add at top: "Warning: Incomplete research — [agent name] failed."

### 6d: Cleanup
Delete temporary files: `.validation/RESEARCH-PAIN.md`, `.validation/RESEARCH-MARKET.md`

## Step 7: Write Memory

For each agent that produced output:
1. Identify learnings from the run (platform insights, tool issues, research tactics that worked)
2. Create project learning entities in MCP Memory (see @memory/operations.md)
3. Check for cross-project promotion opportunities
4. Check for contradictions with existing learnings

If MCP Memory is unavailable, skip silently.

## Step 8: Research Quality Summary

Read merged `.validation/RESEARCH.md` and report:
- Total verified sources
- Number of research gaps
- Number of contradictions
- Any agents that failed
- Any validation flags

Display: "Research complete. [X verified sources, Y gaps, Z contradictions, W validation flags]"

## Step 9: Update State

Update `.validation/STATE.md`:
- Check `research` step with today's date
- Keep `Current Status` as `IN_PROGRESS`

## Step 10: Next Steps

"Research complete. Results in `.validation/RESEARCH.md` and `.validation/COMPETITORS.md`.

Next: Run `/val:score` for the viability scorecard."

</process>
```

- [ ] **Step 3: Commit**

```bash
git add workflows/research.md
git commit -m "refactor(workflow): add memory, tool routing, and validation to research"
```

---

### Task 15: Update workflows/score.md

**Files:**
- Modify: `workflows/score.md` (currently 53 lines)

- [ ] **Step 1: Read the current workflow**

```bash
cat workflows/score.md
```

- [ ] **Step 2: Rewrite the workflow**

Replace the entire contents of `workflows/score.md` with:

```markdown
<purpose>
Dispatch the judge agent to assess idea viability across 7 dimensions.
Injects advisory scoring framework and memory. Validates output.
</purpose>

<process>

## Step 1: Initialize State & Check Prerequisites

Follow @workflows/state.md.

Check for `.validation/IDEA.md`:
- If missing: fail with "Run `/val:idea` or `/val:reverse` first."

Check for `.validation/RESEARCH.md`:
- If missing: warn "No research data found. The judge will score with limited evidence — research-dependent assessments will be less confident. Run `/val:research` first for better results."
- Proceed anyway.

Check for existing SCORECARD.md (overwrite protection).

## Step 2: Read Memory

1. Search MCP Memory for global learnings: `mcp__memory__search_nodes` with query "learning:judge global"
2. Search MCP Memory for project learnings: `mcp__memory__search_nodes` with query "learning:judge {project-id}"
3. Filter, rank by strength + recency, cap at 5
4. Format as `<memory_context>` block
5. Increment `run_count` on each retrieved learning

If MCP Memory is unavailable, skip silently.

## Step 3: Prepare Advisory Framework

Inject the scoring framework as advisory context (not as rules):

```
<advisory_framework>
The standard GSR scoring framework uses 7 dimensions (1-5 each, 35 total):
- 25-35 typically suggests BUILD
- 15-24 typically suggests PIVOT
- <15 typically suggests KILL
- Pain Intensity or Willingness to Pay at 1/5 is historically an auto-KILL signal

These are guidelines based on past validations, not rigid rules. Your reasoned
judgment takes precedence. If you believe the evidence supports a different
conclusion than the numbers suggest, argue your case.
</advisory_framework>
```

## Step 4: Dispatch Judge Agent

Dispatch `gsr-judge` agent with:
- All available `.validation/` artifacts (IDEA.md, RESEARCH.md, COMPETITORS.md, REVERSE-ANALYSIS.md)
- Memory context from Step 2
- Advisory framework from Step 3

Agent writes `.validation/SCORECARD.md`.

## Step 5: Validate Output

**Hard validation (sequential):**
- Dispatch `validators/output-structure.md` against `.validation/SCORECARD.md` with template `templates/SCORECARD.md`
- Dispatch `validators/evidence-integrity.md` against `.validation/SCORECARD.md`
- If either FAIL: feed issues back to judge, retry (max 2)
- If still FAIL: annotate and continue

**Soft validation:**
- Dispatch `validators/scoring-integrity.md` against `.validation/SCORECARD.md`
- Collect flags (unsupported scores, auto-KILL signals, verdict divergence)

## Step 6: Write Memory

1. Store any judge learnings as project memory (scoring patterns, evidence gaps)
2. Check for cross-project promotion
3. If MCP Memory unavailable, skip silently

## Step 7: Display Results

Read `.validation/SCORECARD.md` and display to the founder.

Highlight:
- Overall score and recommendation
- Any auto-KILL signals (from validator flags — presented as signals, not overrides)
- Top red flags
- Any validation flags

## Step 8: Update State

Update `.validation/STATE.md`:
- Check `score` step with today's date

## Step 9: Next Steps

If recommendation is BUILD or PIVOT:
"Run `/val:decide` for the full verdict with specific next steps."

If recommendation is KILL:
"Run `/val:decide` for the full verdict — it will include alternative angles worth exploring."

</process>
```

- [ ] **Step 3: Commit**

```bash
git add workflows/score.md
git commit -m "refactor(workflow): add advisory framework, memory, and validation to score"
```

---

### Task 16: Update workflows/decide.md

**Files:**
- Modify: `workflows/decide.md` (currently 83 lines)

- [ ] **Step 1: Read the current workflow**

```bash
cat workflows/decide.md
```

- [ ] **Step 2: Rewrite the workflow**

Replace the entire contents of `workflows/decide.md` with:

```markdown
<purpose>
Read all validation artifacts and produce the final BUILD/PIVOT/KILL verdict.
Handles missing scorecard by running inline scoring. Generates CONSTRAINTS.md on BUILD.
Uses reasoned judgment — thresholds are advisory.
</purpose>

<process>

## Step 1: Initialize State & Check Prerequisites

Follow @workflows/state.md.

Check for `.validation/IDEA.md`:
- If missing: fail with "Run `/val:idea` or `/val:reverse` first."

Check for `.validation/SCORECARD.md`:
- If missing: warn "No scorecard found. Running inline scoring first..."
  Then follow @workflows/score.md to produce SCORECARD.md before continuing.

Check for existing DECISION.md (overwrite protection).

## Step 2: Read All Artifacts

Read all available `.validation/` files:
- `IDEA.md` (required)
- `RESEARCH.md` (if exists)
- `COMPETITORS.md` (if exists)
- `SCORECARD.md` (required — produced in Step 1 if missing)
- `REVERSE-ANALYSIS.md` (if exists)
- `VALUE-SKEW.md` (if exists)

## Step 3: Read Memory

1. Search MCP Memory for global learnings: `mcp__memory__search_nodes` with query "learning:judge global"
2. Search MCP Memory for project learnings: `mcp__memory__search_nodes` with query "learning:judge {project-id}"
3. Filter, rank, cap at 5, format as `<memory_context>`
4. Increment `run_count`

If MCP Memory unavailable, skip silently.

## Step 4: Produce Verdict

Based on SCORECARD.md assessment and all available evidence, produce the verdict.

The judge's reasoning in SCORECARD.md drives the verdict. The scoring thresholds
(25+ BUILD, 15-24 PIVOT, <15 KILL) are advisory — if the judge argued for a different
conclusion with evidence, respect that reasoning.

### If BUILD (judge recommends BUILD with evidence):
Generate DECISION.md with:
- Verdict summary (2-3 sentences)
- Recommended MVP scope (2-3 features, test riskiest assumption)
- Features NOT in MVP (scope fence)
- Recommended first customer + where to find them
- Pricing recommendation (from competitive data)
- 3 validation milestones before scaling

Also generate `.validation/CONSTRAINTS.md` for GSD handoff.

### If PIVOT (judge identifies potential but significant weaknesses):
Generate DECISION.md with:
- Verdict summary
- What specifically to change and why
- Which dimensions are weak and how to improve
- Suggested re-run instruction

### If KILL (judge finds insufficient evidence for viability):
Generate DECISION.md with:
- Honest, specific reasons
- 2-3 spin-off angles from research (MUST come from actual findings)
- Where energy should go instead

Write `.validation/DECISION.md`.

## Step 5: Validate Output

**Hard validation:**
- Dispatch `validators/output-structure.md` against `.validation/DECISION.md` with template `templates/DECISION.md`
- If FAIL: fix missing sections, retry (max 2)

**Soft validation:**
- Dispatch `validators/evidence-integrity.md` against `.validation/DECISION.md`
- Collect flags (reasoning-heavy verdicts may have fewer citations — that's expected)

## Step 6: Write Memory

1. Store verdict patterns as project memory
2. If a threshold override occurred (e.g., BUILD at 22/35), store as a learning
3. Check for cross-project promotion
4. If MCP Memory unavailable, skip silently

## Step 7: GSD Handoff (BUILD only)

If verdict is BUILD:

1. Write `.validation/CONSTRAINTS.md`
2. Check if GSD is installed:
   - Look for `~/.claude/commands/gsd/` directory
   - If found: "GSD is installed. Run `/gsd:new-project` to start building — it will read your validation constraints automatically."
   - If not found: "Your validation artifacts are in `.validation/`. If you use GSD, it can read these directly. Otherwise, use `CONSTRAINTS.md` as your requirements reference."

## Step 8: Update State

Update `.validation/STATE.md`:
- Check `decide` step with today's date
- Set `Current Status` to `COMPLETE`

## Step 9: Display Verdict

Display the full DECISION.md content to the founder.
Append any validation flags from Step 5.

</process>
```

- [ ] **Step 3: Commit**

```bash
git add workflows/decide.md
git commit -m "refactor(workflow): add reasoned verdicts, memory, and validation to decide"
```

---

### Task 17: Update workflows/skew.md

**Files:**
- Modify: `workflows/skew.md` (currently 87 lines)

- [ ] **Step 1: Read the current workflow**

```bash
cat workflows/skew.md
```

- [ ] **Step 2: Rewrite the workflow**

Replace the entire contents of `workflows/skew.md` with:

```markdown
<purpose>
Orchestrate Value Array analysis using DeMarco's framework. Detect tools, inject memory,
dispatch gsr-value-skewer agent, validate output, display results, and update state.
</purpose>

<process>

## Step 1: Initialize State

Follow @workflows/state.md to ensure `.validation/STATE.md` exists.
Check for existing completed validation (multi-idea guard).
Check for existing `.validation/VALUE-SKEW.md` — overwrite protection.

## Step 2: Determine Input Mode

Check two things:
1. Was a URL provided in `$ARGUMENTS`?
2. Does `.validation/IDEA.md` exist?

| IDEA.md exists | URL provided | Mode |
|---------------|-------------|------|
| Yes | No | `idea_only` |
| No | Yes | `url_only` |
| Yes | Yes | `both` |
| No | No | **Error** |

If neither exists, abort with:
"Provide a competitor URL as an argument, or run `/val:idea` first to capture your idea."

## Step 3: Detect Research Tools (URL modes only)

If mode is `url_only` or `both`:

Attempt a lightweight `mcp__firecrawl__scrape` call against `https://example.com`.

- If it succeeds: set tool_context to use Firecrawl tools
- If it fails: set tool_context to use WebSearch/WebFetch
- Display tool status. Continue either way.

For `idea_only` mode: skip this step entirely.

## Step 4: Read Memory

1. Search MCP Memory for global learnings: `mcp__memory__search_nodes` with query "learning:value-skewer global"
2. Search MCP Memory for project learnings: `mcp__memory__search_nodes` with query "learning:value-skewer {project-id}"
3. Filter, rank by strength + recency, cap at 5
4. Format as `<memory_context>` block
5. Increment `run_count` on each retrieved learning

If MCP Memory unavailable, skip silently.

## Step 5: Dispatch Agent

Dispatch `gsr-value-skewer` agent with:
- Input mode: `idea_only`, `url_only`, or `both`
- URL: the competitor URL from `$ARGUMENTS` (if provided)
- IDEA.md contents (if exists)
- tool_context from Step 3
- memory_context from Step 4

Agent writes `.validation/VALUE-SKEW.md`.

## Step 6: Validate Output

**Hard validation:**
- Dispatch `validators/evidence-integrity.md` against `.validation/VALUE-SKEW.md`
- If FAIL: feed issues back to agent, retry (max 2)
- If still FAIL: annotate and continue

**Soft validation:**
- Dispatch `validators/confidence-calibration.md` against `.validation/VALUE-SKEW.md`
- Collect flags

## Step 7: Write Memory

1. Store skew insights as project memory (which axes had signal, which didn't)
2. Store research tactics that worked (e.g., "competitor pricing page had better data than G2")
3. Check for cross-project promotion
4. If MCP Memory unavailable, skip silently

## Step 8: Display Results

Read `.validation/VALUE-SKEW.md` and display to the founder:

1. Show **Recommended Skew** prominently:
   "**Recommended Skew: [Axis]** — [The Play]"

2. Show **CENTS Advisory** verdict.
   Note: "This is informational — it doesn't affect your validation score."

3. If `both` mode, highlight **Mapping to Your Idea** section.

4. Append any validation flags.

## Step 9: Update State

Update `.validation/STATE.md`:
- Check `skew` step with today's date
- Set `Current Status` to `IN_PROGRESS` if not already

Do NOT update `Entry Point` — skew is supplementary.

## Step 10: Next Steps

Based on current state:
- If no IDEA.md: "Next: Run `/val:idea` or `/val:reverse`."
- If IDEA.md but no RESEARCH.md: "Next: Run `/val:research`."
- If both exist: "Next: Run `/val:score`."

</process>
```

- [ ] **Step 3: Commit**

```bash
git add workflows/skew.md
git commit -m "refactor(workflow): add tool routing, memory, and validation to skew"
```

---

### Task 18: Update workflows/reverse.md

**Files:**
- Modify: `workflows/reverse.md` (currently 85 lines)

- [ ] **Step 1: Read the current workflow**

```bash
cat workflows/reverse.md
```

- [ ] **Step 2: Rewrite the workflow**

Replace the entire contents of `workflows/reverse.md` with:

```markdown
<purpose>
Orchestrate reverse engineering of a competitor. Detect tools, inject memory,
dispatch competitor analyst in deep mode, validate output, present spin-off angles,
convert chosen angle to IDEA.md.
</purpose>

<process>

## Step 1: Initialize State

Follow @workflows/state.md to ensure `.validation/STATE.md` exists.
Check for existing completed validation (multi-idea guard).
Check for existing IDEA.md (overwrite protection).

## Step 2: Detect Research Tools

Attempt a lightweight `mcp__firecrawl__scrape` call against `https://example.com`.

- If it succeeds: set tool_context to use Firecrawl tools
- If it fails: set tool_context to use WebSearch/WebFetch
- Display tool status. Continue either way.

## Step 3: Parse Competitor Input

Read $ARGUMENTS for the competitor name, URL, or app store link.
If no argument provided, ask: "Which competitor do you want to reverse engineer?"

## Step 4: Read Memory

1. Search MCP Memory for global learnings: `mcp__memory__search_nodes` with query "learning:competitor-analyst global"
2. Search MCP Memory for project learnings: `mcp__memory__search_nodes` with query "learning:competitor-analyst {project-id}"
3. Filter, rank by strength + recency, cap at 5
4. Format as `<memory_context>` block
5. Increment `run_count` on each retrieved learning

If MCP Memory unavailable, skip silently.

## Step 5: Deep Competitor Analysis

Dispatch `gsr-competitor-analyst` agent in deep single-product mode with:
- Competitor identifier from Step 3
- tool_context from Step 2
- memory_context from Step 4
- Instruction to produce REVERSE-ANALYSIS.md with 2-3 spin-off angles

Agent writes `.validation/REVERSE-ANALYSIS.md`.

## Step 6: Validate Output

**Hard validation:**
- Dispatch `validators/evidence-integrity.md` against `.validation/REVERSE-ANALYSIS.md`
- If FAIL: feed issues back to agent, retry (max 2)
- If still FAIL: annotate and continue

**Soft validation (parallel):**
- Dispatch `validators/research-coverage.md` against `.validation/REVERSE-ANALYSIS.md`
- Dispatch `validators/confidence-calibration.md` against `.validation/REVERSE-ANALYSIS.md`
- Collect flags

## Step 7: Write Memory

1. Store competitor insights as project memory
2. Store research tactics that worked
3. Check for cross-project promotion
4. If MCP Memory unavailable, skip silently

## Step 8: Present Angles

Read `.validation/REVERSE-ANALYSIS.md` and present spin-off angles ranked by confidence:

"Based on my analysis of [Competitor], here are the spin-off angles:

**Angle 1: [Name]** — [Hook] (Confidence: X/5)
**Angle 2: [Name]** — [Hook] (Confidence: X/5)
**Angle 3: [Name]** — [Hook] (Confidence: X/5)

Pick one (1/2/3) or say **Surprise me**."

Append any validation flags.

## Step 9: Select Angle

If founder picks a number: use that angle.
If "Surprise me": pick highest confidence. State why.

## Step 10: Generate IDEA.md

Convert the chosen angle into IDEA.md format:
- One-Liner: from the angle's hook
- Target Customer: from the angle's target segment
- Core Hypothesis: "If we build [angle] for [target], they will switch from [competitor] because [gap]"
- Riskiest Assumptions: from the gap and segment
- Switching Trigger: from competitor's weakness
- Pricing Intuition: "To be determined from competitive research"
- Monthly Runway Budget: "To be estimated from research"
- Stated Assumptions: note this was generated from reverse analysis

Write to `.validation/IDEA.md`.

## Step 11: Update State

Update `.validation/STATE.md`:
- Check `reverse` and `idea` steps with today's date
- Set `Entry Point` to `reverse`
- Set `Current Status` to `IN_PROGRESS`

## Step 12: Next Steps

"Your reverse analysis is in `.validation/REVERSE-ANALYSIS.md` and the selected angle
is captured in `.validation/IDEA.md`.

Next: Run `/val:research` to validate this angle, or `/val:quick` to run the full pipeline."

</process>
```

- [ ] **Step 3: Commit**

```bash
git add workflows/reverse.md
git commit -m "refactor(workflow): add tool routing, memory, and validation to reverse"
```

---

### Task 19: Update workflows/idea.md

**Files:**
- Modify: `workflows/idea.md` (currently 46 lines)

- [ ] **Step 1: Read the current workflow**

```bash
cat workflows/idea.md
```

- [ ] **Step 2: Update the workflow**

The idea workflow is minimal and the interviewer is mostly unchanged. Add output validation only.

Replace the entire contents of `workflows/idea.md` with:

```markdown
<purpose>
Orchestrate the idea capture interview. Initialize state, check for existing
validation, dispatch the interviewer agent, validate output, and update state.
</purpose>

<process>

## Step 1: Initialize State

Follow @workflows/state.md to ensure `.validation/STATE.md` exists.

## Step 2: Check for Existing Validation

If `.validation/STATE.md` shows `Current Status: COMPLETE`:
- Warn: "A completed validation exists. Delete `.validation/` to start fresh, or use git to branch."
- Wait for confirmation.

If `.validation/IDEA.md` already exists:
- Warn: "An existing idea was found. This will overwrite it. Continue? (y/n)"
- Wait for confirmation.

## Step 3: Run Interview

Dispatch the `gsr-interviewer` agent.

The agent handles:
- All 6 questions (with adaptive skipping and "Surprise me")
- Synthesis into IDEA.md format
- Founder review and adjustment
- Writing `.validation/IDEA.md`

Note: The interviewer does not receive memory context (it's a conversational agent,
not a research agent). Memory write happens after validation.

## Step 4: Validate Output

**Hard validation:**
- Dispatch `validators/output-structure.md` against `.validation/IDEA.md` with template `templates/IDEA.md`
- If FAIL: feed issues back to interviewer, retry (max 2)
- If still FAIL: warn founder and continue

## Step 5: Write Memory

Store project learnings from the interview:
- If founder used "Surprise me" on multiple questions, store as project learning
  (category: `success-pattern`, signal: "Founder deferred N questions to inference")
- If founder struggled to articulate switching trigger or riskiest assumption, store
  (category: `failure-mode`, signal: "Founder couldn't articulate [field]")

If MCP Memory unavailable, skip silently.

## Step 6: Update State

Update `.validation/STATE.md`:
- Check the `idea` step with today's date
- Set `Entry Point` to `idea`
- Set `Current Status` to `IN_PROGRESS`

## Step 7: Next Steps

"Your idea is captured in `.validation/IDEA.md`.

Next: Run `/val:research` to research the market, or `/val:quick` to run the full pipeline."

</process>
```

- [ ] **Step 3: Commit**

```bash
git add workflows/idea.md
git commit -m "refactor(workflow): add output validation and memory write to idea workflow"
```

---

### Task 20: Update workflows/quick.md

**Files:**
- Modify: `workflows/quick.md` (currently 52 lines)

- [ ] **Step 1: Read the current workflow**

```bash
cat workflows/quick.md
```

- [ ] **Step 2: Update the workflow**

The quick workflow delegates to other workflows, which now handle memory and validation internally. Minimal change — just acknowledge the new architecture.

Replace the entire contents of `workflows/quick.md` with:

```markdown
<purpose>
Run the full validation pipeline in one command: idea → research → score → decide.
Detects existing IDEA.md from /val:reverse and offers to continue.
Each sub-workflow handles its own tool detection, memory, and validation.
</purpose>

<process>

## Step 1: Initialize State

Follow @workflows/state.md to ensure `.validation/STATE.md` exists.
Check for completed validation (multi-idea guard).

## Step 2: Check for Existing IDEA.md

If `.validation/IDEA.md` exists:
- Display: "Found an existing idea: [read one-liner from IDEA.md]"
- Ask: "Continue with this idea, or start fresh? (continue/fresh)"
- If "fresh": delete existing `.validation/` artifacts, re-initialize STATE.md
- If "continue": skip to Step 4

## Step 3: Run Interview (if no IDEA.md)

Display: "Step 1/4: Capturing your idea..."

Follow @workflows/idea.md for the interview.
Wait for completion before proceeding.

## Step 4: Run Research

Display: "Step 2/4: Researching the market (3 agents in parallel)..."

Follow @workflows/research.md for parallel research.
Wait for all agents to complete.

## Step 5: Run Scoring

Display: "Step 3/4: Scoring viability..."

Follow @workflows/score.md for evidence-based scoring.

## Step 6: Run Decision

Display: "Step 4/4: Producing verdict..."

Follow @workflows/decide.md for final verdict.

## Step 7: Summary

Display the final verdict from `.validation/DECISION.md`.

Note: Each sub-workflow handles its own memory read/write and validation.
The quick workflow only orchestrates the sequence.

</process>
```

- [ ] **Step 3: Commit**

```bash
git add workflows/quick.md
git commit -m "refactor(workflow): update quick to acknowledge sub-workflow memory and validation"
```

### Task 20b: Update workflows/help.md

**Files:**
- Modify: `workflows/help.md` (currently 69 lines)

- [ ] **Step 1: Read the current workflow**

```bash
cat workflows/help.md
```

- [ ] **Step 2: Update the help display**

Add a new section after "Better Research (Optional)" in the help output. Insert before `## Current Progress`:

```markdown
## How It Works (v0.4.0)

GSR uses a three-layer architecture:

- **Agents** reason freely about your idea — they think, not follow scripts
- **Validators** check agent output for quality (evidence integrity, structure, coverage)
- **Memory** compounds learnings across runs — GSR gets better the more you use it

Hard validators (evidence integrity, output structure) retry automatically.
Soft validators (coverage, confidence calibration) surface flags for you to review.
```

- [ ] **Step 3: Commit**

```bash
git add workflows/help.md
git commit -m "docs(workflow): add architecture overview to help display"
```

---

## Chunk 5: Version Bump, Changelog, and End-to-End Verification

### Task 21: Update VERSION and CHANGELOG

**Files:**
- Modify: `VERSION`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Read current VERSION and CHANGELOG**

```bash
cat VERSION
head -30 CHANGELOG.md
```

- [ ] **Step 2: Bump VERSION to 0.4.0**

Write `VERSION`:
```
0.4.0
```

This is a minor version bump — the architecture changed significantly but the external command interface is identical.

- [ ] **Step 3: Update CHANGELOG.md**

Prepend to `CHANGELOG.md` (before existing content):

```markdown
## 0.4.0 — 2026-03-19

### Architecture: Thin Agent, Heavy Tools

Major internal redesign separating agents, validators, and memory into three distinct layers.

**Agent layer** — All 6 agents rewritten as pure reasoning briefs. Agents focus on thinking, not following rigid templates. The judge now reasons through the scoring framework as advisory guidance, not mechanical rules.

**Validator layer** — New `validators/` directory with 5 validators:
- `evidence-integrity` (hard) — checks source URLs on factual claims
- `output-structure` (hard) — checks required sections against templates
- `research-coverage` (soft) — flags platform breadth gaps
- `scoring-integrity` (soft) — surfaces auto-KILL signals and unsupported scores
- `confidence-calibration` (soft) — flags confidence/evidence mismatches

Hard validators retry (max 2). Soft validators annotate output with flags.

**Memory layer** — New `memory/` module using MCP Memory Server:
- 3-layer memory: working (session), project (per-idea), global (cross-project)
- Agents receive relevant past learnings before execution
- Learnings compound over time — project insights promote to global after cross-project confirmation
- Token-efficient: max 5 learnings per agent, terse format, targeted retrieval

**Workflow changes** — All workflows updated to orchestrate the three layers:
- Tool routing centralized (Firecrawl detection done once, injected into agents)
- Memory read before agent execution, memory write after validation
- Validator dispatch with hard/soft classification per workflow

No changes to commands, templates, state management, or `.validation/` structure.
External behavior is identical — internal reasoning is dramatically improved.
```

- [ ] **Step 4: Commit**

```bash
git add VERSION CHANGELOG.md
git commit -m "chore: bump version to 0.4.0, document thin-agent-heavy-tools architecture"
```

---

### Task 22: End-to-end verification

- [ ] **Step 1: Verify all new files exist**

```bash
ls validators/
ls memory/
```

Expected: 5 validator files, 2 memory files.

- [ ] **Step 2: Verify agent line counts dropped**

```bash
wc -l agents/gsr-*.md
```

Expected: All agents significantly shorter than originals. Total should be roughly 300-350 lines (down from ~700+).

- [ ] **Step 3: Verify no broken cross-references**

Check that workflows reference files that exist:

```bash
grep -r "@workflows/" workflows/ | grep -v "state.md" | head -20
grep -r "@memory/" workflows/ | head -10
grep -r "validators/" workflows/ | head -10
```

All referenced files should exist.

- [ ] **Step 4: Verify template files referenced by validators exist**

```bash
ls templates/
```

Expected: IDEA.md, SCORECARD.md, DECISION.md, RESEARCH.md, COMPETITORS.md, REVERSE-ANALYSIS.md, VALUE-SKEW.md, CONSTRAINTS.md, STATE.md all present.

Cross-check: grep workflows for `templates/` references and confirm each target exists:
```bash
grep -r "templates/" workflows/ | grep -o "templates/[A-Z-]*.md" | sort -u
```

- [ ] **Step 5: Run /val:quick against a test idea**

This is a manual verification step. In a separate session, run `/val:quick` with a simple test idea (e.g., "An AI tool that writes meeting summaries").

**Pass criteria:**
- Interview completes and produces `.validation/IDEA.md`
- Research spawns 3 agents and produces `.validation/RESEARCH.md` + `.validation/COMPETITORS.md`
- Score produces `.validation/SCORECARD.md` with reasoned assessment (not mechanical rubric)
- Decide produces `.validation/DECISION.md` with verdict
- No validator errors that prevent completion (warnings are OK)
- If MCP Memory is available: verify `mcp__memory__search_nodes` with query "gsr" returns entities after the run

- [ ] **Step 6: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address end-to-end verification issues"
```
