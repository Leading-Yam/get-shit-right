# GetShitRight — Design Spec

## Overview

GetShitRight (GSR) is a free, open-source Claude Code plugin that validates SaaS ideas before code gets written. It produces evidence-backed BUILD/PIVOT/KILL decisions with a default-kill philosophy — protecting non-technical solo founders from wasting time building the wrong thing.

**Relationship to GSD:** GetShitRight owns BEFORE. GSD owns BUILD. They handshake via `.validation/CONSTRAINTS.md` but are fully independent. GetShitRight works without GSD.

**Distribution:** Claude Code slash commands plugin (like GSD). No CLI wrapper, no runtime dependencies beyond Claude Code.

**Installation:** `claude install get-shit-right` (or manual: clone repo, then `claude plugin add /path/to/get-shit-right`). This registers all `/val:*` slash commands.

**License:** MIT

---

## Architecture

### Design Principles

1. **Standalone first** — works without GSD or any other tool. GSD integration is a bonus when detected.
2. **Evidence over opinion** — every claim cites a source or explicitly marks itself as an assumption.
3. **Opinionated defaults** — agents make smart assumptions, state them clearly, let the founder override.
4. **Default-kill scoring** — the tool actively looks for reasons to say no. BUILD is hard to earn.
5. **No enterprise roleplay** — direct, concise language. No "stakeholder alignment" or "synergy."
6. **YAGNI** — no skills directory, no phase/milestone complexity. Bounded domain, lean structure.

### Project Structure

```
get-shit-right/
├── commands/
│   └── val/                         # /val:* slash commands (Claude Code convention)
│       ├── idea.md                  # /val:idea — interview & capture
│       ├── reverse.md               # /val:reverse — reverse engineer competitor
│       ├── research.md              # /val:research — parallel market research
│       ├── score.md                 # /val:score — evidence-based scorecard
│       ├── decide.md                # /val:decide — BUILD/PIVOT/KILL verdict
│       ├── quick.md                 # /val:quick — full pipeline in one command
│       └── help.md                  # /val:help — usage guide
├── agents/
│   ├── gsr-interviewer.md           # Structured idea extraction
│   ├── gsr-researcher.md            # Pain validation research
│   ├── gsr-competitor-analyst.md    # Competitive landscape
│   ├── gsr-market-sizer.md          # TAM/SAM/SOM estimation
│   └── gsr-judge.md                 # Scoring & verdict (default-kill stance)
├── workflows/                       # Implementation logic delegated from commands
│   ├── state.md                     # State management (.validation/STATE.md)
│   ├── help.md                      # Help display workflow
│   ├── idea.md                      # Interview orchestration
│   ├── reverse.md                   # Reverse engineering orchestration
│   ├── research.md                  # Parallel research orchestration
│   ├── score.md                     # Scoring orchestration
│   ├── decide.md                    # Verdict and GSD handoff
│   └── quick.md                     # Full pipeline orchestration
├── templates/                       # Reference examples embedded in agent prompts;
│   │                                # these files serve as canonical format docs
│   │                                # for contributors, not programmatic templates
│   ├── IDEA.md                  # Structured idea output format
│   ├── REVERSE-ANALYSIS.md      # Reverse engineer analysis format
│   ├── RESEARCH.md              # Market research findings format
│   ├── COMPETITORS.md           # Competitive analysis format
│   ├── SCORECARD.md             # Viability scorecard format
│   ├── DECISION.md              # BUILD/PIVOT/KILL verdict format
│   └── CONSTRAINTS.md           # GSD handoff file format
├── CLAUDE.md                    # Project rules for Claude Code
├── README.md                    # Installation & usage docs
├── VERSION                      # Version number
└── LICENSE                      # MIT
```

### State Directory

Commands write outputs to `.validation/` in the user's project root.

```
.validation/
├── REVERSE-ANALYSIS.md   # Only if /val:reverse was used
├── IDEA.md
├── RESEARCH.md
├── COMPETITORS.md
├── SCORECARD.md
├── DECISION.md
├── CONSTRAINTS.md         # Only on BUILD verdict
└── STATE.md               # Workflow progress tracker
```

---

## Commands

### `/val:idea` — Capture & Structure the Idea

Dispatches `val-interviewer` agent for an adaptive interview (max 6 questions, one at a time).

**Questions:**

1. What does this product do in one sentence? *(required)*
2. Who specifically has this problem? *(offers "Surprise me")*
3. What do they do today to solve it? *(offers "Surprise me")*
4. Why would they switch to your thing? *(offers "Surprise me")*
5. How would you charge for it? *(offers "Surprise me")*
6. What's the one thing that must be true for this to work? *(required)*

When the founder picks "Surprise me," the agent infers a reasonable answer based on the idea description, states the assumption explicitly ("I'll assume your target is X because Y — correct me if I'm wrong"), and moves on.

The agent is adaptive — if an earlier answer covers a later question, it skips it. Names assumptions the founder didn't state.

**Output:** `.validation/IDEA.md`

```markdown
# Idea: [Name]

## One-Liner
[Product does X for Y so they can Z]

## Target Customer
- **Who:** [Specific persona]
- **Context:** [When/where they feel the pain]
- **Current Solution:** [What they do today]

## Core Hypothesis
[If we build X, then Y will happen, because Z]

## Riskiest Assumptions
1. [Assumption about customer]
2. [Assumption about willingness to pay]
3. [Assumption about market size]

## Switching Trigger
[Why would someone stop doing what they do today]

## Pricing Intuition
[Founder's initial pricing thought or agent's assumption]

## Stated Assumptions
- [Assumptions the agent made on "Surprise me" answers]
```

---

### `/val:reverse` — Reverse Engineer a Competitor

Alternative entry point. Founder provides a competitor (URL, product name, or app store link) instead of their own idea.

**Flow:**

```
/val:reverse "Calendly"
        │
        ▼
val-competitor-analyst (deep single-product mode)
  - Feature map, pricing tiers
  - Review mining (G2, Capterra, Reddit, Twitter/X)
  - Negative review patterns, underserved segments
        │
        ▼
Spin-off Angle Generation
  - 2-3 angles with rationale
  - Each: target segment, gap exploited, differentiation hook
  - Founder picks one (or "Surprise me")
        │
        ▼
Writes .validation/IDEA.md (from chosen angle)
        │
        ▼
Normal pipeline: /val:research → /val:score → /val:decide
```

**Output:** `.validation/REVERSE-ANALYSIS.md` and `.validation/IDEA.md` (both written in one command)

When the founder picks "Surprise me" for angle selection, the agent picks the angle with the strongest combination of: (1) largest underserved segment, (2) weakest existing competition, and (3) clearest differentiation hook. It states why it chose that angle.

```markdown
# Reverse Analysis: [Competitor Name]

## Product Overview
- **What it does:** [one-liner]
- **Pricing:** [tiers]
- **Estimated scale:** [users/revenue if findable]

## Strengths
- [What they do well, from positive reviews]

## Weaknesses & Gaps
- [From negative reviews, complaints, missing features]
- [Underserved segments they ignore]
- [Pricing gaps]

## Spin-off Angles

### Angle 1: [Name]
- **Target:** [Specific segment the competitor ignores]
- **Gap exploited:** [What's missing/broken for this segment]
- **Hook:** [One-sentence differentiation]

### Angle 2: [Name]
...

### Angle 3: [Name]
...
```

---

### `/val:research` — Parallel Market Research

Spawns 3 agents concurrently:

```
val-research (orchestrator)
├── val-researcher        → Pain validation (Reddit, HN, Indie Hackers, Twitter/X)
├── val-competitor-analyst → Competitive landscape (web search, G2, Capterra)
└── val-market-sizer      → TAM/SAM/SOM estimation (public data, LinkedIn, reports)
```

**Research tool detection:** Before spawning agents, the orchestrator detects available tools using try-and-fallback: agents attempt to use enhanced tools (Firecrawl MCP) first, and if the tool call fails (tool not found), they fall back to built-in WebSearch/WebFetch. No config file parsing needed.

- `WebSearch`/`WebFetch` — always available, used as baseline
- Firecrawl MCP — if available, agents use it for deeper page scraping (detected via attempted tool call)
- Other search MCPs — used opportunistically if present (same try-and-fallback pattern)

**Firecrawl nudge:** On first run, if Firecrawl is not detected: "Tip: Install the Firecrawl MCP plugin for deeper research results. GetShitRight works without it, but competitor reviews and Reddit threads are more reliably scraped with it. Run `claude mcp add firecrawl` to set it up." Shown once only (tracked in `STATE.md` as `firecrawl_nudge_shown: true`).

Each agent includes confidence scoring (High/Medium/Low) and explicitly lists what it couldn't find or verify.

**Output:** `.validation/RESEARCH.md`

```markdown
# Market Research: [Idea Name]

## Pain Validation
- **Signal Strength:** [Strong / Moderate / Weak]
- **Confidence:** [High / Medium / Low]
- **Sources Analyzed:** [count] across [platforms]
- **Key Findings:**
  - [Finding 1 with source link]
  - [Finding 2 with source link]
- **Representative Quotes:**
  > "[Quote]" — r/[subreddit], [date]
  > "[Quote]" — [source], [date]
- **Pain Frequency:** [X mentions across Y sources in Z timeframe]

## Market Size
- **TAM:** $[X] ([methodology])
- **SAM:** $[X] ([segment definition])
- **SOM (Year 1):** $[X] ([assumptions])
- **Confidence:** [High / Medium / Low]
- **Data Sources:** [list]

## Research Gaps
- [What we couldn't find / verify]
- [Assumptions that remain unvalidated]
```

**Output:** `.validation/COMPETITORS.md`

```markdown
# Competitive Analysis: [Idea Name]

## Direct Competitors
| Name | Pricing | Users/Revenue | Key Strength | Key Weakness |
|------|---------|---------------|--------------|--------------|
| [A]  | $X/mo   | ~Y users      | [strength]   | [weakness]   |

## Competitor Gap Analysis
- **Underserved segment:** [who competitors ignore]
- **Missing features:** [from negative reviews]
- **Pricing gaps:** [price points not covered]
- **UX complaints:** [common friction points]

## Differentiation Opportunities
1. [Opportunity 1 with evidence]
2. [Opportunity 2 with evidence]
```

---

### `/val:score` — Evidence-Based Scorecard

Dispatches `val-judge` agent. Reads `IDEA.md`, `RESEARCH.md`, and `COMPETITORS.md`.

**Scoring (7 dimensions, each 1-5, total 35):**

| Dimension | What It Measures |
|-----------|-----------------|
| Pain Intensity | How badly do people need this? (from research quotes + frequency) |
| Willingness to Pay | Evidence of spending on alternatives or stated willingness |
| Competition Density | How crowded is the space? (inverse: less = higher score) |
| Differentiation Clarity | Can you articulate why you're different in one sentence? |
| Founder-Market Fit | Does the founder understand this market? (from interview signals) |
| Build Complexity | Can this be MVP'd in <4 weeks? |
| Distribution Clarity | Is there an obvious channel to reach customers? |

**Default-kill calibration:**

| Score Range | Quality Label | Recommendation |
|-------------|--------------|----------------|
| 25-35 | STRONG | BUILD |
| 15-24 | MODERATE | PIVOT |
| 8-14 | WEAK | KILL |
| Any (with 1/5 on Pain or WTP) | CRITICAL | KILL (auto) |

- **Auto-KILL override:** A single 1/5 on Pain Intensity or Willingness to Pay forces CRITICAL/KILL regardless of total score

**Output:** `.validation/SCORECARD.md`

```markdown
# Validation Scorecard: [Idea Name]

## Overall Score: [X]/35 — [STRONG / MODERATE / WEAK / CRITICAL]
## Recommendation: [BUILD / PIVOT / KILL]

| Dimension | Score | Confidence | Evidence |
|-----------|-------|------------|----------|
| Pain Intensity | 4/5 | High | 23 Reddit threads, avg 47 upvotes |
| Willingness to Pay | 3/5 | Medium | Competitors charge $29-99/mo |
| Competition Density | 2/5 | High | 6 direct competitors |
| Differentiation | 4/5 | Medium | No competitor targets [segment] |
| Founder-Market Fit | 3/5 | Medium | Domain experience, no audience |
| Build Complexity | 5/5 | High | Standard CRUD + API integrations |
| Distribution | 3/5 | Medium | 3 identifiable subreddits + LinkedIn |

## Red Flags
- [Flag 1: specific concern with evidence]

## Bright Spots
- [Spot 1: specific positive signal]

## Unvalidated Assumptions
- [Assumption that research couldn't confirm or deny]
```

---

### `/val:decide` — BUILD / PIVOT / KILL

Reads all `.validation/` artifacts. Produces final verdict.

**Output:** `.validation/DECISION.md`

```markdown
# Decision: [BUILD / PIVOT / KILL]

## Verdict
[2-3 sentence summary of why]

## If BUILD:

### Recommended MVP Scope
- [Core feature 1 — tests the riskiest assumption]
- [Core feature 2]
- **NOT in MVP:** [feature X, feature Y]

### Recommended First Customer
[Specific segment + where to find them]

### Pricing Recommendation
[$X/mo based on competitive analysis and WTP signals]

### Validation Milestones (before scaling)
1. [X paying customers in Y weeks]
2. [Z% retention after first month]
3. [Specific signal that confirms riskiest assumption]

## If PIVOT:

### What to Change
[Specific pivot direction with reasoning]

### Suggested Re-run
"Update your IDEA.md with the pivot and re-run /val:research"

## If KILL:

### Why
[Honest, specific reasons]

### But Consider These Angles
[2-3 spin-off ideas, vertical niches, or adjacent opportunities surfaced during research — every KILL includes alternatives]

### Where the Energy Should Go
[Alternative direction if any emerged from research]
```

**GSD handoff (on BUILD):**

- Checks if GSD is installed
- **GSD detected:** Generates `CONSTRAINTS.md`, prompts: "GSD is installed. Run `/gsd:new-project` to start building — it will read your validation constraints automatically."
- **GSD not detected:** Generates `CONSTRAINTS.md` anyway: "Your validation artifacts are in `.validation/`. If you use GSD, it can read these directly. Otherwise, use `CONSTRAINTS.md` as your requirements reference."

**Output (BUILD only):** `.validation/CONSTRAINTS.md` *(this is the canonical schema — GetShitRight defines it; GSD reads it as-is)*

```markdown
# Project Constraints (from Validation)

## Validated Idea
[One-liner from IDEA.md]

## Must-Have Requirements
- [Core features from DECISION.md MVP scope only]

## Must-NOT-Have (Scope Fence)
- [Features explicitly excluded from MVP]

## Target User
- [Refined persona from research, not just founder's guess]

## Competitive Context
- [Key differentiators to maintain]

## Pricing
- [Recommended pricing from DECISION.md]

## Success Criteria
- [Validation milestones from DECISION.md]

## Riskiest Assumptions (Still Unvalidated)
- [From SCORECARD.md — things to watch post-launch]
```

---

### `/val:quick` — Full Pipeline in One Command

Runs the full pipeline in sequence, pausing only for the initial interview.

**Behavior:**

- If `IDEA.md` already exists (e.g., from `/val:reverse`): asks "Found an existing idea. Continue with this, or start fresh?"
- If no `IDEA.md`: starts with the interview
- Then runs research → score → decide automatically
- Shows progress updates between stages

---

### `/val:help` — Usage Guide

Shows available commands, explains the workflow, and displays current state from `STATE.md`.

**Content:**
- Command reference with descriptions
- Recommended flows by starting point:
  - "I have an idea" → `/val:idea` → `/val:research` → `/val:score` → `/val:decide`
  - "I have a competitor I want to beat" → `/val:reverse` → `/val:research` → `/val:score` → `/val:decide`
  - "Just do everything" → `/val:quick`
- "Optional but recommended" note about Firecrawl for better research
- Current `.validation/` progress if any exists (reads `STATE.md`)

---

## Agents

### Shared Principles

- Evidence over opinion — every claim cites a source or marks itself as assumption
- Opinionated defaults — make smart assumptions, state them, let founder override
- Transparent confidence — findings tagged High/Medium/Low
- No enterprise roleplay — direct, concise language

### `val-interviewer`

**Purpose:** Structured idea extraction through adaptive interview.

**Personality:** Friendly but efficient. Respects time. Gets to the point.

**Behavior:**
- One question at a time
- Questions 2-5 offer "Surprise me" — agent infers answer, states assumption explicitly
- Questions 1 and 6 are mandatory
- Adaptive — skips questions already covered by prior answers
- Names assumptions the founder didn't state

### `val-researcher`

**Purpose:** Pain validation through web research.

**Personality:** Skeptical investigator. Looks for real pain signals, not hype.

**Behavior:**
- Searches Reddit, HN, Indie Hackers, Twitter/X for people describing the pain
- Counts frequency and intensity — upvotes and engagement matter
- Extracts direct quotes with sources
- Reports when searches return weak results with Low confidence
- Uses Firecrawl if detected, falls back to WebSearch/WebFetch

### `val-competitor-analyst`

**Purpose:** Competitive landscape mapping and gap identification.

**Personality:** Thorough mapper. Finds what exists, spots gaps.

**Behavior:**
- Identifies direct and adjacent competitors
- Maps pricing tiers and feature sets
- Mines negative reviews for gap opportunities
- Surfaces underserved verticals and spin-off angles (feeds KILL-with-alternatives)
- Deep single-product mode when called from `/val:reverse`

### `val-market-sizer`

**Purpose:** TAM/SAM/SOM estimation with conservative methodology.

**Personality:** Conservative estimator. Shows the math, doesn't inflate.

**Behavior:**
- Uses public data: industry reports, LinkedIn job counts, census data
- Cross-references with similar SaaS revenue data
- All estimates include confidence bands
- Flags when data is too thin to estimate reliably

### `val-judge`

**Purpose:** Evidence-based scoring with default-kill stance.

**Personality:** The hard one. Actively looks for reasons to say no.

**Behavior:**
- Scores 7 dimensions, each 1-5 with cited evidence and per-dimension confidence (High/Medium/Low)
- BUILD requires 25+/35
- 1/5 on Pain Intensity or Willingness to Pay = auto KILL
- Always surfaces spin-off/vertical alternatives on KILL/PIVOT
- Lists unvalidated assumptions that could change the verdict

---

## Error Handling & Edge Cases

### Weak Research Results

- Findings marked with confidence levels (High/Medium/Low)
- Insufficient data → scored conservatively at 2/5 with note
- `RESEARCH.md` includes "Research Gaps" section
- If overall research quality is too low: "Research signals are weak across the board. Consider validating manually before trusting this scorecard."

### Re-running Commands

- Before overwriting existing `.validation/` artifact: warns and asks confirmation
- No version history stored — git handles that
- Each command reads whatever exists in `.validation/` — partial re-runs supported

### `/val:reverse` into `/val:quick`

If `IDEA.md` exists from `/val:reverse`, `/val:quick` detects it and asks: "Found an existing idea from reverse analysis. Continue with this, or start fresh?"

### No Internet / Search Failures

- `/val:idea` works fine (no web needed)
- `/val:research` fails gracefully: "Web search unavailable. Research requires internet access."
- `/val:score` and `/val:decide` can run on manually provided research if the founder writes `RESEARCH.md` themselves

### STATE.md Tracking

```markdown
# Validation State

## Current Status: [NOT_STARTED / IN_PROGRESS / COMPLETE]

## Steps
- [x] idea — 2026-03-15
- [x] reverse — 2026-03-15 (if used)
- [x] research — 2026-03-15
- [ ] score
- [ ] decide

## Entry Point: [idea / reverse]

## Config
- firecrawl_nudge_shown: false
```

Commands check `STATE.md` to warn if running out of order (e.g., `/val:score` before `/val:research`). Warning only — doesn't block, since the founder might have manually created the artifacts.

### Out-of-Order Execution

If a command runs without its prerequisite artifacts:
- **`/val:research` without `IDEA.md`:** Fails with "Run `/val:idea` or `/val:reverse` first to capture your idea."
- **`/val:score` without `RESEARCH.md`:** Warns but proceeds — scores what it can from `IDEA.md` alone, marks research-dependent dimensions as 2/5 with "No research data available."
- **`/val:decide` without `SCORECARD.md`:** Warns but proceeds — runs inline scoring (same as `/val:score`), writes `SCORECARD.md` to disk, updates `STATE.md`, then produces verdict. Equivalent to running `/val:score` + `/val:decide` together.

### Multi-Idea Projects

One idea per `.validation/` directory. To validate a new idea, archive or delete the existing `.validation/` directory first. The tool warns if `.validation/` already contains a completed validation: "A completed validation exists. Delete `.validation/` to start fresh, or use git to branch."

---

## GSD Integration

### Handoff Mechanism

When `/val:decide` produces BUILD:

```
.validation/CONSTRAINTS.md  →  Referenced by /gsd:new-project discussion phase
.validation/COMPETITORS.md  →  Available context for GSD's research agent
.validation/SCORECARD.md    →  Referenced by GSD's requirements scoping
```

`CONSTRAINTS.md` is structured so GSD's interviewer can read it and skip redundant questions.

### What GetShitRight Does NOT Do

- Does not trigger GSD commands automatically
- Does not write to `.planning/`
- Does not assume any specific build tool
- The handoff is a suggestion, not an action

---

## Not In Scope

- `/ops` workflow (separate DoneRight project, separate repo)
- CLI wrapper
- External runtime dependencies
- Automatic GSD triggering
- Paid features or tiers
