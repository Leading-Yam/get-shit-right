# GSR v0.2: Firecrawl Mandate & Research Quality Enhancements

**Date:** 2026-03-17
**Status:** Approved
**Scope:** Research workflow, reverse workflow, all research agents, templates, changelog

## Problem

GSR's research phase risks hallucination because agents fall back to WebSearch/WebFetch when Firecrawl is unavailable. These built-in tools produce unreliable scraping results, and agents can fabricate sources without detection. Additionally, research output lacks structured evidence, scoring alignment, and deduplication — degrading both quality and founder trust.

## Decisions

| # | Decision | Choice |
|---|----------|--------|
| 1 | Firecrawl requirement | Hard gate — fail fast if unavailable |
| 2 | Agent tool strategy | Firecrawl-only — remove WebSearch/WebFetch |
| 3 | Availability check | Real probe call at workflow start |
| 4 | Error message style | Install command + why it matters |
| 5 | Discovery tool | Firecrawl search replaces WebSearch |
| 6 | Nudge removal | Delete nudge, gate replaces it |
| 7 | Changelog | CHANGELOG.md at root, Keep a Changelog format |
| 8 | Enhancement tracking | docs/enhancements-v0.2.md (personal reference, not shipped) |

## Tool Name Convention

Throughout this spec, shorthand tool names map to MCP tool names as follows:

| Shorthand | MCP Tool Name |
|-----------|--------------|
| `firecrawl_search` | `mcp__firecrawl__search` |
| `firecrawl_scrape` | `mcp__firecrawl__scrape` |

Agent instructions should use the full `mcp__firecrawl__*` names.

## Error Handling & Resilience

These rules apply across all phases:

**Rate limiting:** If a Firecrawl call returns a rate limit error, wait 5 seconds and retry once. If the retry also fails, log the failed query in Research Coverage and continue. Do not abort the workflow for rate limit errors.

**Mid-research failures:** If a Firecrawl call fails after the probe succeeded (timeout, 500 error, quota exhaustion), retry once. If the retry fails, log the failed call in Research Coverage and continue with remaining searches. Do not fabricate data to fill gaps.

**Zero results:** If `firecrawl_search` returns zero results for a query, retry once with broader query terms. If still zero, log it in `## Research Coverage` as "0 results" with the query attempted. Zero-result searches count toward the minimum budget as "attempted" — the minimum is attempts, not successes.

**Missing agent output:** Before reading each temporary file during merge, check if it exists. If an agent's output file is missing, log a warning and continue the merge with available data. Add a prominent warning in the final output: "Incomplete research — [agent name] failed to produce results."

---

## Phase 1: Firecrawl Foundation (v0.2.0)

### 1.1 Firecrawl Probe Gate

Add a shared probe step to both `workflows/research.md` and `workflows/reverse.md`. The probe runs immediately after state initialization, before any other step that might need web access. Make a lightweight `mcp__firecrawl__scrape` call against `https://example.com`.

**On failure, abort with:**

```
Firecrawl plugin required for research.

GetShitRight uses Firecrawl for reliable web scraping — without it,
research results may contain hallucinated sources and unverifiable claims.

Install it free from the Plugin Marketplace:
  /plugin → select firecrawl → /reload-plugins

Then re-run this command.
```

**On success:** proceed to next step.

**Placement:**
- `workflows/research.md` — new Step 2 (after state init, before agent spawning)
- `workflows/reverse.md` — new Step 2 (after state init, before competitor input parsing, so the workflow fails fast before any user interaction)

### 1.2 Remove WebSearch/WebFetch From Agents

Update the `tools` frontmatter line in each agent file. This section shows only the changed tool lines — other tools not listed here (like `Bash`, `Glob`) remain at the command level and are not part of agent tool declarations.

**Agent tool changes:**
- `agents/gsr-researcher.md` — tools: `Read, Write, mcp__firecrawl__*`
- `agents/gsr-competitor-analyst.md` — tools: `Read, Write, mcp__firecrawl__*`
- `agents/gsr-market-sizer.md` — tools: `Read, Write, mcp__firecrawl__*`

**Command allowed-tools changes:**
- `commands/val/research.md` — remove `WebSearch`, `WebFetch` from allowed-tools
- `commands/val/reverse.md` — remove `WebSearch`, `WebFetch` from allowed-tools

### 1.3 Rewrite Agent Search Instructions

All three research agents get their search strategy sections rewritten:

- **Discovery:** Use `mcp__firecrawl__search` for finding relevant URLs (replaces WebSearch)
- **Content extraction:** Use `mcp__firecrawl__scrape` for deep page content (replaces WebFetch)
- **No fallback logic.** Remove all "try X first, fall back to Y" instructions.

### 1.4 Remove Firecrawl Nudge

- `workflows/research.md` — Delete Step 2 (Firecrawl Nudge) entirely. Replace with probe gate (1.1). Delete Step 2b (Web Search Availability fallback).
- `templates/STATE.md` — Remove `firecrawl_nudge_shown` from config section.

### 1.5 Add CHANGELOG.md

Create `CHANGELOG.md` at project root using Keep a Changelog format. Initial entry for v0.2.0.

---

## Phase 2: Research Quality (v0.2.1)

### 2.1 Structured Evidence Format

Add `<evidence_rules>` section to all research agents. Every factual claim must follow:

```
- **Claim:** [factual statement]
  - **Source:** [URL]
  - **Platform:** Reddit / HN / G2 / Capterra / etc.
  - **Engagement:** [upvotes, comments, or review count]
  - **Confidence:** High / Medium / Low
```

Claims without URLs must be tagged `[UNVERIFIED]` and excluded from signal strength calculations.

**Confidence calibration:**
- **High:** 3+ independent sources with URLs
- **Medium:** 2 sources with URLs, or 1 authoritative source (e.g., G2 with 50+ reviews)
- **Low:** 1 source, or inference from limited data

### 2.2 Agent Self-Review Step

Each agent gets a final instruction block before writing output:

> Before writing your final output, re-read every claim. For any claim missing a source URL, either find the source or mark it `[UNVERIFIED]`. Count verified vs unverified claims. If more than 30% are unverified, add a warning at the top: "Research quality degraded — X% of findings could not be verified."

### 2.3 Search Budget Per Agent

**gsr-researcher:**
- Must attempt all 4 platforms (Reddit, HN, Indie Hackers, Twitter/X) with min 2 searches each = 8 minimum attempts
- Max 16 total searches
- Must attempt all 4 platforms before going deeper on any
- If a platform consistently returns zero or irrelevant results, note the gap and redistribute remaining budget to platforms yielding data
- Report coverage: "Searched: Reddit (4), HN (3), Indie Hackers (0 — no results), Twitter/X (3)"

**gsr-competitor-analyst (Standard Mode):**
- Must attempt all 3 source types (G2/Capterra reviews, pricing pages, general web) = 3 minimum attempts
- Max 12 total searches
- Must attempt at least one review site before reporting weaknesses
- Report coverage: "Sources checked: G2 (2), Capterra (1), Reddit (3), pricing pages (2)"

**gsr-market-sizer:**
- Min 3 search attempts (industry reports, demographic/job data, competitor benchmarks)
- Max 10 total searches
- Must attempt at least 2 independent data sources for TAM
- Report coverage: "Data sources: Statista (1), LinkedIn (2), Census (1), competitor pricing (2)"

Agents must include `## Research Coverage` section listing searches per platform, including zero-result platforms with the queries attempted. If minimum coverage isn't met, explain why.

**Note on platform availability:** Some platforms (Indie Hackers, Twitter/X) may have limited Firecrawl indexing. These are best-effort — agents must attempt them but are not penalized for zero results as long as the attempt and query are documented.

### 2.4 Research-to-Scoring Alignment

Each agent's output gets a `## Scoring Input` section mapping findings to the 7 scoring dimensions:

| Scoring Dimension | Primary Agent | Secondary Agent |
|---|---|---|
| Pain Intensity (1-5) | gsr-researcher | — |
| Willingness to Pay (1-5) | gsr-researcher | gsr-competitor-analyst |
| Market Size (1-5) | gsr-market-sizer | — |
| Competition (1-5) | gsr-competitor-analyst | — |
| Feasibility (1-5) | — (founder input) | — |
| Founder Fit (1-5) | — (founder input) | — |
| Timing (1-5) | gsr-researcher | gsr-market-sizer |

Format per dimension:

```
### Pain Intensity
- **Evidence suggests:** 3-4/5
- **Reasoning:** 12 verified threads with moderate engagement, pain described but workarounds exist
- **Key evidence:** [top 3 sources with URLs]
```

### 2.5 Smart Merge

Replace blind concatenation in `workflows/research.md` Step 4. The merge is performed by the orchestrating LLM (the workflow executor) as an explicit reasoning step, not a mechanical copy-paste.

**Input files:** Read `RESEARCH-PAIN.md`, `RESEARCH-MARKET.md`, and the `## Scoring Input` section from `COMPETITORS.md`.

Before reading each file, check if it exists. If missing, log a warning and continue with available data (see Error Handling section).

**Merge operations:**

1. **Deduplication** — Scan for overlapping URLs across agent outputs using literal URL string matching. Consolidate duplicates, note independent discovery as a positive signal: "Found independently by pain researcher and competitor analyst."

2. **Cross-referencing** — Compare assessments across agents for the same scoring dimensions (e.g., pain researcher's willingness-to-pay signals vs competitor analyst's pricing gap findings). Flag disagreements in `## Contradictions` section with both sides cited.

3. **Signal reinforcement** — Add `## Converging Signals` section highlighting findings supported by 2+ agents.

4. **Scoring consolidation** — Collect all agents' `## Scoring Input` sections (including from `COMPETITORS.md`) into a single `## Scoring Inputs` view, showing side-by-side assessments when two agents contribute to the same dimension.

### 2.6 Actionable Research Gaps

Replace free-form gap lists with structured table:

```
## Research Gaps & Recommended Actions

| Gap | Scoring Dimension at Risk | Suggested Action |
|-----|--------------------------|-----------------|
| No pricing data for CompetitorX | Willingness to Pay | Sign up for free trial or check LinkedIn Sales Navigator |
| No Reddit threads for segment Y | Pain Intensity | Post in r/[relevant] or interview 3 people in this segment |
| TAM data older than 2023 | Market Size | Check Statista or IBISWorld for updated reports |
```

Each gap connects to a scoring dimension so founders know which scores are at risk.

### 2.7 Estimated Maintenance Cost

Add a runway reality check to the research output so founders know what it costs to keep their product alive with zero users.

**Idea interview change (`gsr-interviewer`):**

Add Question 5b (after pricing, before riskiest assumption). Offers "Surprise me":

> "What's your monthly budget to keep this running with zero paying users? Think hosting, APIs, subscriptions. Or say **Surprise me** and I'll skip this — the research phase will estimate it."

If "Surprise me": Mark as "To be estimated from research."

**IDEA.md template change:**

Add new field after `Pricing Intuition`:

```
## Monthly Runway Budget
[Founder's stated budget or "To be estimated from research"]
```

**Market sizer agent change (`gsr-market-sizer`):**

Add new output section after TAM/SAM/SOM. The market sizer infers likely tech stack from the idea description and competitor research, then estimates:

```
## Estimated Maintenance Cost (Zero Users)

### Tech Stack Estimate
- **Hosting:** $X-Y/mo (based on [reasoning])
- **Database:** $X-Y/mo
- **Third-party APIs:** $X-Y/mo (e.g., email, auth, payments)
- **Domain + DNS:** $X-Y/mo
- **Total range:** $X-Y/mo
- **Confidence:** High / Medium / Low
- **Assumptions:** [what the estimate is based on]

### Budget Check
- **Founder's stated budget:** $Z/mo (from IDEA.md)
- **Status:** Budget covers estimated range / Budget is tight / Budget insufficient
```

This is informational output only — no warnings injected into the decision verdict. The data speaks for itself.

### 2.8 Updated RESEARCH.md Template Structure

The `templates/RESEARCH.md` template gets updated with this section ordering:

```
# Research: [Idea Name]

## Pain Validation
[from gsr-researcher]

## Market Size
[from gsr-market-sizer]

## Estimated Maintenance Cost
[from gsr-market-sizer — tech stack estimate + budget check]

## Scoring Inputs
[consolidated from all agents — side-by-side per dimension]

## Converging Signals
[findings supported by 2+ agents]

## Contradictions
[disagreements between agents with both sides cited]

## Research Coverage
[merged coverage tables from all agents]

## Research Gaps & Recommended Actions
[structured table with scoring dimension links and suggested actions]
```

---

## Phase 3: Reverse Engineer + UX (v0.2.2)

### 3.1 Progress Callbacks

Add workflow-level status messages to `workflows/research.md`. Since Claude Code's Agent tool blocks until completion for parallel agents, callbacks are scoped to workflow milestones:

- After probe: `"Firecrawl verified. Spawning 3 research agents..."`
- After all agents complete: `"All agents complete. Pain researcher: X sources. Competitor analyst: Y sources. Market sizer: Z sources. Merging and cross-referencing..."`
- After merge: `"Research complete. [X verified sources, Y gaps, Z contradictions found]"`

Note: Per-agent completion callbacks during parallel execution are not feasible with the current Agent tool model. If Claude Code adds streaming agent updates in the future, individual agent callbacks can be added.

### 3.2 Firecrawl Gate for Reverse

Same probe logic as research workflow, added to `workflows/reverse.md` immediately after state initialization (before Step 2 — Parse Competitor Input). This ensures fail-fast before any user interaction.

### 3.3 Structured Scraping Targets (Deep Mode)

Add explicit scraping checklist to `gsr-competitor-analyst` deep single-product mode:

1. Product website — homepage + pricing page (`mcp__firecrawl__scrape`)
2. G2 reviews — `"[competitor] reviews site:g2.com"` (`mcp__firecrawl__search`)
3. Capterra reviews — `"[competitor] reviews site:capterra.com"` (`mcp__firecrawl__search`)
4. Reddit discussions — `"[competitor] site:reddit.com"` (`mcp__firecrawl__search`)
5. Crunchbase — `"[competitor] crunchbase"` (`mcp__firecrawl__search`)
6. LinkedIn — `"[competitor] LinkedIn"` (`mcp__firecrawl__search`)
7. Twitter/X — `"[competitor] complaints OR alternative OR switching"` (`mcp__firecrawl__search`)

Must attempt all 7. Report which succeeded and which returned no results. Zero-result targets count as attempted.

### 3.4 Evidence-Backed Angles

Update `REVERSE-ANALYSIS.md` template. Each angle must include:

```
### Angle 1: [Name]
- **Target:** [Specific segment]
- **Gap exploited:** [What's missing/broken]
- **Hook:** [One-sentence differentiation]
- **Evidence:**
  - [Review theme with URL] (X mentions across Y reviews)
  - [Reddit thread with URL] (Z upvotes)
  - [Feature request with URL]
- **Evidence strength:** Strong / Moderate / Weak
```

Angles with "Weak" evidence get flagged: "This angle is speculative — validate manually before pursuing."

### 3.5 Moat Check

Each angle gets:

```
- **Moat assessment:** Easy / Medium / Hard for competitor to replicate
- **Reasoning:** [e.g., "requires deep integration with X that competitor has deprioritized for 2+ years based on unanswered feature requests"]
```

"Easy" moat triggers warning: "Competitor could close this gap quickly. Only pursue if you can establish lock-in before they react."

### 3.6 Angle Confidence Scoring

Each angle gets a composite score:

```
- **Confidence score:** [1-5]
  - Evidence strength: [1-5]
  - Segment size signal: [1-5]
  - Moat durability: [1-5]
```

Presentation in reverse workflow Step 4 changes to ranked list:

```
"Based on my analysis of [Competitor], here are 3 spin-off angles (ranked by confidence):

**Angle 1: [Name]** — [Hook] (Confidence: 4/5)
**Angle 2: [Name]** — [Hook] (Confidence: 3/5)
**Angle 3: [Name]** — [Hook] (Confidence: 2/5 ⚠️ speculative)
```

This replaces the existing "Surprise me" selection criteria in `workflows/reverse.md` Step 5. The previous three-factor heuristic (largest underserved segment + weakest competition + clearest hook) is superseded by the composite confidence score.

---

## Files Changed (All Phases)

| File | Phase | Changes |
|------|-------|---------|
| `workflows/research.md` | 1, 2, 3 | Probe gate, remove nudge, smart merge, progress callbacks |
| `workflows/reverse.md` | 1, 3 | Probe gate (before input parsing) |
| `agents/gsr-researcher.md` | 1, 2 | Tools, search strategy, evidence rules, budget, scoring input, self-review |
| `agents/gsr-competitor-analyst.md` | 1, 2, 3 | Tools, search strategy, evidence rules, budget, scoring input, self-review, scraping targets, angle enhancements |
| `agents/gsr-market-sizer.md` | 1, 2 | Tools, search strategy, evidence rules, budget, scoring input, self-review, maintenance cost estimate |
| `agents/gsr-interviewer.md` | 2 | Add Question 5b (monthly runway budget) |
| `templates/IDEA.md` | 2 | Add Monthly Runway Budget field |
| `commands/val/research.md` | 1 | Remove WebSearch/WebFetch from allowed-tools |
| `commands/val/reverse.md` | 1 | Remove WebSearch/WebFetch from allowed-tools |
| `templates/STATE.md` | 1 | Remove firecrawl_nudge_shown |
| `templates/RESEARCH.md` | 2 | New section ordering: Scoring Inputs, Converging Signals, Contradictions, Research Coverage, Research Gaps table |
| `templates/REVERSE-ANALYSIS.md` | 3 | Add evidence, moat, confidence to angle template |
| `CHANGELOG.md` | 1 | New file |
