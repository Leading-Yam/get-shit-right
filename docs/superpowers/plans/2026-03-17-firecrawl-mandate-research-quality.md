# GSR v0.2: Firecrawl Mandate & Research Quality — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mandate Firecrawl as a hard requirement for all research, remove WebSearch/WebFetch fallback, add structured evidence format with citations, search budgets, scoring alignment, smart merge, maintenance cost estimation, and reverse engineer enhancements.

**Architecture:** This is a markdown-only codebase (Claude Code plugin). All changes are to agent instruction files, workflow files, command definitions, and templates. No application code — changes are prompt engineering and document structure.

**Tech Stack:** Markdown, YAML frontmatter, XML-like agent instruction format

**Spec:** `docs/superpowers/specs/2026-03-17-firecrawl-mandate-research-quality-design.md`

---

## Chunk 1: Phase 1 — Firecrawl Foundation (v0.2.0)

### Task 1: Update agent tool declarations

**Files:**
- Modify: `agents/gsr-researcher.md:4`
- Modify: `agents/gsr-competitor-analyst.md:4`
- Modify: `agents/gsr-market-sizer.md:4`

- [ ] **Step 1: Update gsr-researcher tools**

In `agents/gsr-researcher.md`, change line 4 from:
```
tools: Read, Write, WebSearch, WebFetch, mcp__firecrawl__*
```
to:
```
tools: Read, Write, mcp__firecrawl__*
```

- [ ] **Step 2: Update gsr-competitor-analyst tools**

In `agents/gsr-competitor-analyst.md`, change line 4 from:
```
tools: Read, Write, WebSearch, WebFetch, mcp__firecrawl__*
```
to:
```
tools: Read, Write, mcp__firecrawl__*
```

- [ ] **Step 3: Update gsr-market-sizer tools**

In `agents/gsr-market-sizer.md`, change line 4 from:
```
tools: Read, Write, WebSearch, WebFetch, mcp__firecrawl__*
```
to:
```
tools: Read, Write, mcp__firecrawl__*
```

- [ ] **Step 4: Commit**

```bash
git add agents/gsr-researcher.md agents/gsr-competitor-analyst.md agents/gsr-market-sizer.md
git commit -m "feat(agents): remove WebSearch/WebFetch from research agent tools"
```

---

### Task 2: Update command allowed-tools

**Files:**
- Modify: `commands/val/research.md:5-11`
- Modify: `commands/val/reverse.md:5-13`

- [ ] **Step 1: Update research command**

In `commands/val/research.md`, change the allowed-tools section from:
```yaml
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - WebSearch
  - WebFetch
  - Agent
  - mcp__firecrawl__*
```
to:
```yaml
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Agent
  - mcp__firecrawl__*
```

- [ ] **Step 2: Update reverse command**

In `commands/val/reverse.md`, change the allowed-tools section from:
```yaml
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - WebSearch
  - WebFetch
  - AskUserQuestion
  - Agent
  - mcp__firecrawl__*
```
to:
```yaml
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - AskUserQuestion
  - Agent
  - mcp__firecrawl__*
```

- [ ] **Step 3: Commit**

```bash
git add commands/val/research.md commands/val/reverse.md
git commit -m "feat(commands): remove WebSearch/WebFetch from research and reverse allowed-tools"
```

---

### Task 3: Rewrite agent search instructions for Firecrawl

**Files:**
- Modify: `agents/gsr-researcher.md:17-39`
- Modify: `agents/gsr-competitor-analyst.md:32-36` (standard), `63-66` (deep)
- Modify: `agents/gsr-market-sizer.md:34-36`

- [ ] **Step 1: Rewrite gsr-researcher search strategy**

In `agents/gsr-researcher.md`, replace the `## Research Process` section (lines 17-34) and `## Research Tool Strategy` section (lines 36-39) with:

```markdown
## Research Process

1. Read `.validation/IDEA.md` to understand the idea, target customer, and pain point
2. Construct targeted search queries using `mcp__firecrawl__search`:
   - "[pain point] site:reddit.com" — look for people describing the problem
   - "[pain point] site:news.ycombinator.com" — HN discussions
   - "[pain point] site:indiehackers.com" — founder discussions
   - "[target persona] [pain point]" — general web discovery
   - "[competitor name] complaints" or "[competitor name] alternative" — switching signals
3. For promising results, use `mcp__firecrawl__scrape` to extract full page content
4. For each platform, collect:
   - Number of relevant threads/posts found
   - Engagement metrics (upvotes, comments, likes)
   - Direct quotes describing the pain (with source URLs)
   - Recency of discussions
5. Assess overall signal strength:
   - **Strong:** 10+ threads with meaningful engagement, pain described vividly
   - **Moderate:** 5-10 threads, moderate engagement, pain mentioned but not emphasized
   - **Weak:** <5 threads, low engagement, pain only implied

## Research Tool Strategy

Use `mcp__firecrawl__search` for all discovery (finding relevant URLs). Use `mcp__firecrawl__scrape` for deep content extraction from specific pages. No other web tools — Firecrawl is the only research tool.

**Error handling:**
- If a Firecrawl call returns a rate limit error, wait 5 seconds and retry once. If retry fails, log the failed query in Research Coverage and continue.
- If a Firecrawl call fails (timeout, 500 error), retry once. If retry fails, log in Research Coverage and continue. Do not fabricate data.
- If a search returns zero results, retry once with broader terms. If still zero, log as "0 results" with the query attempted.
```

- [ ] **Step 2: Rewrite gsr-competitor-analyst research approach**

In `agents/gsr-competitor-analyst.md`, replace the `**Research approach:**` block in Standard Mode (lines 32-36) with:

```markdown
**Research approach:**
- Use `mcp__firecrawl__search` for all discovery queries. Use `mcp__firecrawl__scrape` to extract full page content from review sites and pricing pages.
- Search G2, Capterra, Reddit, Twitter/X for review themes
- Look for "I wish [competitor] had..." and "[competitor] doesn't work for..." patterns
- Tag each finding with confidence: High / Medium / Low
- If a search fails or returns zero results, retry once with broader terms. Log failures in Research Coverage.
```

Also replace the research approach in Deep Single-Product Mode (lines 63-66) with:

```markdown
**Research approach:**
- Use `mcp__firecrawl__search` for all discovery. Use `mcp__firecrawl__scrape` for deep page content.
- Go deeper on reviews — look for patterns, not individual complaints
- Check subreddits, Twitter/X threads, blog posts comparing alternatives
- If a search fails or returns zero results, retry once. Log failures.
```

- [ ] **Step 3: Rewrite gsr-market-sizer research tool strategy**

In `agents/gsr-market-sizer.md`, replace the `## Research Tool Strategy` section (lines 34-36) with:

```markdown
## Research Tool Strategy

Use `mcp__firecrawl__search` for all discovery (industry reports, job data, demographic data). Use `mcp__firecrawl__scrape` for extracting detailed data from specific pages. No other web tools — Firecrawl is the only research tool.

**Error handling:**
- If a Firecrawl call returns a rate limit error, wait 5 seconds and retry once. If retry fails, log the failed query in Research Coverage and continue.
- If a Firecrawl call fails (timeout, 500 error), retry once. If retry fails, log in Research Coverage and continue. Do not fabricate data.
- If a search returns zero results, retry once with broader terms. If still zero, log as "0 results" with the query attempted.
```

- [ ] **Step 4: Commit**

```bash
git add agents/gsr-researcher.md agents/gsr-competitor-analyst.md agents/gsr-market-sizer.md
git commit -m "feat(agents): rewrite search instructions for Firecrawl-only research"
```

---

### Task 4: Add Firecrawl probe gate to research workflow

**Files:**
- Modify: `workflows/research.md:9-30`

- [ ] **Step 1: Replace Steps 2 and 2b with Firecrawl probe gate**

In `workflows/research.md`, replace Steps 2 and 2b (lines 19-30) with:

```markdown
## Step 2: Firecrawl Probe Gate

Make a lightweight `mcp__firecrawl__scrape` call against `https://example.com`.

**If the call fails** (tool not found, connection error, any error):
Abort the workflow with:
"Firecrawl plugin required for research.

GetShitRight uses Firecrawl for reliable web scraping — without it, research results may contain hallucinated sources and unverifiable claims.

Install it free from the Plugin Marketplace:
  /plugin → select firecrawl → /reload-plugins

Then re-run /val:research."

**If the call succeeds:** proceed to Step 3.
```

- [ ] **Step 2: Commit**

```bash
git add workflows/research.md
git commit -m "feat(workflow): add Firecrawl probe gate to research workflow"
```

---

### Task 5: Remove Firecrawl nudge from STATE.md template and state workflow

**Files:**
- Modify: `templates/STATE.md:16`
- Modify: `workflows/state.md:22`

- [ ] **Step 1: Remove firecrawl_nudge_shown from STATE.md template**

In `templates/STATE.md`, replace lines 15-16:
```markdown
## Config
- firecrawl_nudge_shown: false
```
with:
```markdown
## Config
```

- [ ] **Step 2: Update state workflow config reference**

In `workflows/state.md`, change line 22 from:
```
- `Config` — key-value pairs (firecrawl_nudge_shown, etc.)
```
to:
```
- `Config` — key-value pairs (reserved for future use)
```

- [ ] **Step 3: Commit**

```bash
git add templates/STATE.md workflows/state.md
git commit -m "fix(state): remove firecrawl_nudge_shown config field"
```

---

### Task 6: Create CHANGELOG.md

**Files:**
- Create: `CHANGELOG.md`

- [ ] **Step 1: Create CHANGELOG.md at project root**

```markdown
# Changelog

All notable changes to GetShitRight will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-03-17

### Added
- Firecrawl probe gate — research and reverse workflows verify Firecrawl is installed before running
- CHANGELOG.md for tracking releases

### Changed
- Research agents now use Firecrawl exclusively (removed WebSearch/WebFetch fallback)
- Agent search instructions rewritten for `mcp__firecrawl__search` (discovery) and `mcp__firecrawl__scrape` (content extraction)

### Removed
- Firecrawl "nudge" tip — replaced by hard gate
- `firecrawl_nudge_shown` config field from STATE.md

## [0.1.0] - 2026-03-15

### Added
- Initial release: idea interview, parallel research, scoring, decision pipeline
- 7 slash commands: `/val:idea`, `/val:research`, `/val:score`, `/val:decide`, `/val:quick`, `/val:reverse`, `/val:help`
- 5 specialized agents: interviewer, researcher, competitor analyst, market sizer, judge
- Default-kill philosophy: BUILD requires 25+/35
```

- [ ] **Step 2: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs: add CHANGELOG.md with v0.2.0 entry"
```

---

## Chunk 2: Phase 2 — Research Quality (v0.2.1)

### Task 7: Add structured evidence format to all research agents

**Files:**
- Modify: `agents/gsr-researcher.md` (before `</behavior>`)
- Modify: `agents/gsr-competitor-analyst.md` (before `</confidence_rules>`)
- Modify: `agents/gsr-market-sizer.md` (before `</behavior>`)

- [ ] **Step 1: Add evidence rules to gsr-researcher**

In `agents/gsr-researcher.md`, add before the closing `</behavior>` tag:

```markdown

## Evidence Rules

Every factual claim must follow this format:

- **Claim:** [factual statement]
  - **Source:** [URL]
  - **Platform:** Reddit / HN / Indie Hackers / Twitter/X / other
  - **Engagement:** [upvotes, comments, or reply count]
  - **Confidence:** High / Medium / Low

Claims without a source URL must be tagged `[UNVERIFIED]` and excluded from signal strength calculations.

**Confidence calibration:**
- **High:** 3+ independent sources with URLs confirming the finding
- **Medium:** 2 sources with URLs, or 1 authoritative source
- **Low:** 1 source, or inference from limited data
```

- [ ] **Step 2: Add evidence rules to gsr-competitor-analyst**

In `agents/gsr-competitor-analyst.md`, replace the `<confidence_rules>` section (lines 72-77) with:

```markdown
<confidence_rules>

## Evidence Rules

Every factual claim must follow this format:

- **Claim:** [factual statement]
  - **Source:** [URL]
  - **Platform:** G2 / Capterra / Reddit / Twitter/X / Crunchbase / other
  - **Engagement:** [review count, upvotes, or follower count]
  - **Confidence:** High / Medium / Low

Claims without a source URL must be tagged `[UNVERIFIED]` and excluded from analysis.

**Confidence calibration:**
- **High:** 3+ independent sources with URLs confirming the finding
- **Medium:** 2 sources with URLs, or 1 authoritative source (e.g., G2 with 50+ reviews)
- **Low:** 1 source, or inference from limited data
- Always state what you couldn't find: "Could not find pricing data for [X]"

</confidence_rules>
```

- [ ] **Step 3: Add evidence rules to gsr-market-sizer**

In `agents/gsr-market-sizer.md`, add before the closing `</behavior>` tag:

```markdown

## Evidence Rules

Every data point and estimate must include its source:

- **Claim:** [market data or estimate]
  - **Source:** [URL]
  - **Data type:** Industry report / Census data / LinkedIn job data / Competitor benchmark
  - **Date:** [publication or retrieval date]
  - **Confidence:** High / Medium / Low

Data points without a source URL must be tagged `[UNVERIFIED]` and flagged in Research Gaps.

**Confidence calibration:**
- **High:** 3+ independent sources with URLs, published within last 2 years
- **Medium:** 2 sources with URLs, or 1 authoritative source (e.g., Statista, IBISWorld)
- **Low:** 1 source, inference, or data older than 3 years
```

- [ ] **Step 4: Commit**

```bash
git add agents/gsr-researcher.md agents/gsr-competitor-analyst.md agents/gsr-market-sizer.md
git commit -m "feat(agents): add structured evidence format with citation rules"
```

---

### Task 8: Add agent self-review step to all research agents

**Files:**
- Modify: `agents/gsr-researcher.md` (add after Evidence Rules, before `</behavior>`)
- Modify: `agents/gsr-competitor-analyst.md` (add after `</confidence_rules>`, before `<output_format>`)
- Modify: `agents/gsr-market-sizer.md` (add after Evidence Rules, before `</behavior>`)

- [ ] **Step 1: Add self-review to gsr-researcher**

In `agents/gsr-researcher.md`, add after the Evidence Rules section, before `</behavior>`:

```markdown

## Self-Review (Before Writing Output)

Before writing your final output, re-read every claim you've made:
1. For any claim missing a source URL, either find the source or mark it `[UNVERIFIED]`
2. Count verified vs unverified claims
3. If more than 30% are unverified, add a warning at the top of your output: "Research quality degraded — X% of findings could not be verified."
4. Remove any claim that you cannot trace back to a specific search result
```

- [ ] **Step 2: Add self-review to gsr-competitor-analyst**

In `agents/gsr-competitor-analyst.md`, add after `</confidence_rules>` and before `<output_format>`:

```markdown

<self_review>
Before writing your final output, re-read every claim:
1. For any claim missing a source URL, either find the source or mark it `[UNVERIFIED]`
2. Count verified vs unverified claims
3. If more than 30% are unverified, add a warning at the top: "Research quality degraded — X% of findings could not be verified."
4. Remove any claim that you cannot trace back to a specific search result
</self_review>
```

- [ ] **Step 3: Add self-review to gsr-market-sizer**

In `agents/gsr-market-sizer.md`, add after Evidence Rules, before `</behavior>`:

```markdown

## Self-Review (Before Writing Output)

Before writing your final output, re-read every data point:
1. For any data point missing a source URL, either find the source or mark it `[UNVERIFIED]`
2. Count verified vs unverified data points
3. If more than 30% are unverified, add a warning at the top: "Research quality degraded — X% of data points could not be verified."
4. When two data points conflict, use the lower one and cite both sources
```

- [ ] **Step 4: Commit**

```bash
git add agents/gsr-researcher.md agents/gsr-competitor-analyst.md agents/gsr-market-sizer.md
git commit -m "feat(agents): add self-review step to catch unverified claims"
```

---

### Task 9: Add search budget constraints to all research agents

**Files:**
- Modify: `agents/gsr-researcher.md` (add after Self-Review, before `</behavior>`)
- Modify: `agents/gsr-competitor-analyst.md` (add in Standard Mode section)
- Modify: `agents/gsr-market-sizer.md` (add after Self-Review, before `</behavior>`)

- [ ] **Step 1: Add search budget to gsr-researcher**

In `agents/gsr-researcher.md`, add after Self-Review, before `</behavior>`:

```markdown

## Search Budget

- Must attempt all 4 platforms (Reddit, HN, Indie Hackers, Twitter/X) with min 2 searches each = 8 minimum attempts
- Max 16 total searches
- Must attempt all 4 platforms before going deeper on any single one
- If a platform consistently returns zero or irrelevant results, note the gap and redistribute remaining budget to platforms yielding data

**Note:** Some platforms (Indie Hackers, Twitter/X) may have limited Firecrawl indexing. These are best-effort — attempt them but do not penalize yourself for zero results as long as the attempt and query are documented.
```

- [ ] **Step 2: Add search budget to gsr-competitor-analyst**

In `agents/gsr-competitor-analyst.md`, add after the Standard Mode research approach section:

```markdown

**Search budget (Standard Mode):**
- Must attempt all 3 source types (G2/Capterra reviews, pricing pages, general web) = 3 minimum attempts
- Max 12 total searches
- Must attempt at least one review site before reporting weaknesses
```

- [ ] **Step 3: Add search budget to gsr-market-sizer**

In `agents/gsr-market-sizer.md`, add after Self-Review, before `</behavior>`:

```markdown

## Search Budget

- Min 3 search attempts (industry reports, demographic/job data, competitor benchmarks)
- Max 10 total searches
- Must attempt at least 2 independent data sources for TAM cross-reference
```

- [ ] **Step 4: Commit**

```bash
git add agents/gsr-researcher.md agents/gsr-competitor-analyst.md agents/gsr-market-sizer.md
git commit -m "feat(agents): add search budget constraints for focused research"
```

---

### Task 10: Add scoring input sections to all research agents

**Files:**
- Modify: `agents/gsr-researcher.md` (`<output_format>` section)
- Modify: `agents/gsr-competitor-analyst.md` (`<output_format>` section)
- Modify: `agents/gsr-market-sizer.md` (`<output_format>` section)

- [ ] **Step 1: Add scoring input to gsr-researcher output format**

In `agents/gsr-researcher.md`, update the `<output_format>` section. After "Include:" add:

```markdown
- Scoring Input section with assessments for:
  - Pain Intensity (1-5): evidence suggests X, reasoning, top 3 sources
  - Willingness to Pay (1-5): evidence suggests X, reasoning, top 3 sources
  - Timing (1-5): evidence suggests X, reasoning, top 3 sources
- Research Coverage section listing searches per platform (including zero-result platforms)
```

- [ ] **Step 2: Add scoring input to gsr-competitor-analyst output format**

In `agents/gsr-competitor-analyst.md`, update the Standard Mode output format. After the existing COMPETITORS.md structure, add:

```markdown

Include a `## Scoring Input` section at the end of COMPETITORS.md:
- Competition (1-5): evidence suggests X, reasoning, top 3 sources
- Willingness to Pay (1-5): evidence suggests X, reasoning, top 3 sources
- Research Coverage section listing searches per source type
```

- [ ] **Step 3: Add scoring input to gsr-market-sizer output format**

In `agents/gsr-market-sizer.md`, update the `<output_format>` section. After "Include:" add:

```markdown
- Scoring Input section with assessments for:
  - Market Size (1-5): evidence suggests X, reasoning, top 3 sources
  - Timing (1-5): evidence suggests X, reasoning, top 3 sources
- Research Coverage section listing searches per data source type
```

- [ ] **Step 4: Commit**

```bash
git add agents/gsr-researcher.md agents/gsr-competitor-analyst.md agents/gsr-market-sizer.md
git commit -m "feat(agents): add scoring input sections aligned to 7 dimensions"
```

---

### Task 11: Rewrite research workflow merge step (smart merge)

**Files:**
- Modify: `workflows/research.md` (Steps 4-5)

- [ ] **Step 1: Replace Step 4 with smart merge**

In `workflows/research.md`, replace the current Step 4 (Merge Research Results) with:

```markdown
## Step 4: Smart Merge

Read the outputs from the parallel agents. Before reading each file, check if it exists. If an agent's output file is missing, log a warning and continue with available data.

**Input files:**
- `.validation/RESEARCH-PAIN.md` (from gsr-researcher)
- `.validation/RESEARCH-MARKET.md` (from gsr-market-sizer)
- `.validation/COMPETITORS.md` `## Scoring Input` section (from gsr-competitor-analyst)

**Merge operations (perform as explicit reasoning steps):**

### 4a: Deduplication
Scan all agent outputs for overlapping URLs (literal string matching). When the same URL appears in multiple agent outputs:
- Consolidate into a single reference
- Note: "Found independently by [agent 1] and [agent 2]" — this is a positive signal

### 4b: Cross-Referencing
Compare assessments across agents for the same scoring dimensions:
- Pain researcher's willingness-to-pay signals vs competitor analyst's pricing gap findings
- Pain researcher's timing signals vs market sizer's timing signals
- Flag any disagreements for the Contradictions section

### 4c: Assemble RESEARCH.md
Combine into `.validation/RESEARCH.md` following the template structure:
1. Pain Validation (from RESEARCH-PAIN.md)
2. Market Size (from RESEARCH-MARKET.md)
3. Estimated Maintenance Cost (from RESEARCH-MARKET.md)
4. Scoring Inputs (consolidated from all agents — side-by-side when two agents assess the same dimension)
5. Converging Signals (findings supported by 2+ agents)
6. Contradictions (disagreements between agents with both sides cited)
7. Research Coverage (merged coverage tables from all agents)
8. Research Gaps & Recommended Actions (merged from all agents, each gap linked to a scoring dimension with a suggested founder action)

If any agent's output was missing, add at the top: "⚠️ Incomplete research — [agent name] failed to produce results."

### 4d: Cleanup
Delete the temporary files:
- `.validation/RESEARCH-PAIN.md`
- `.validation/RESEARCH-MARKET.md`
```

- [ ] **Step 2: Replace Step 5 with updated quality assessment**

In `workflows/research.md`, replace the current Step 5 (Research Quality Assessment) with:

```markdown
## Step 5: Research Quality Summary

Read the merged `.validation/RESEARCH.md` and report:
- Total verified sources across all agents
- Number of research gaps identified
- Number of contradictions found between agents
- Any agents that failed to produce output

Display: "Research complete. [X verified sources, Y gaps, Z contradictions found]"
```

- [ ] **Step 3: Commit**

```bash
git add workflows/research.md
git commit -m "feat(workflow): replace blind merge with smart merge + quality summary"
```

---

### Task 12: Add estimated maintenance cost to interviewer, IDEA.md, and market sizer

**Files:**
- Modify: `agents/gsr-interviewer.md:55-60`
- Modify: `templates/IDEA.md:22-23`
- Modify: `agents/gsr-market-sizer.md` (output format)

- [ ] **Step 1: Add Question 5b to gsr-interviewer**

In `agents/gsr-interviewer.md`, after Question 5 (lines 55-60) and before Question 6, add:

```markdown

### Question 5b (Offers "Surprise me")
"What's your monthly budget to keep this running with zero paying users? Think hosting,
APIs, subscriptions. Or say **Surprise me** and I'll skip this — the research phase
will estimate it."

If "Surprise me": Mark as "To be estimated from research."
Note this as an assumption.
```

Also update line 21 from:
```
3. Questions 2-5 offer "Surprise me" as an option.
```
to:
```
3. Questions 2-5b offer "Surprise me" as an option.
```

- [ ] **Step 2: Add Monthly Runway Budget to IDEA.md template**

In `templates/IDEA.md`, after the `## Pricing Intuition` section (line 23), add:

```markdown

## Monthly Runway Budget
[Founder's stated budget or "To be estimated from research"]
```

- [ ] **Step 3: Update gsr-interviewer output format**

In `agents/gsr-interviewer.md`, update the `<output_format>` section (line 80-88). Add `- ## Monthly Runway Budget` after `- ## Pricing Intuition`.

- [ ] **Step 4: Add maintenance cost section to gsr-market-sizer**

In `agents/gsr-market-sizer.md`, update the `<output_format>` section. After "Market Size section" add:

```markdown
- Estimated Maintenance Cost section:
  - Tech Stack Estimate: Hosting, Database, Third-party APIs, Domain + DNS — each with $X-Y/mo range and reasoning
  - Total range with confidence level
  - Budget Check: compare against founder's Monthly Runway Budget from IDEA.md
  - Status: "Budget covers estimated range" / "Budget is tight" / "Budget insufficient"
```

- [ ] **Step 5: Commit**

```bash
git add agents/gsr-interviewer.md templates/IDEA.md agents/gsr-market-sizer.md
git commit -m "feat: add estimated maintenance cost to interview, IDEA.md, and market sizer"
```

---

### Task 13: Update RESEARCH.md template

**Files:**
- Modify: `templates/RESEARCH.md`

- [ ] **Step 1: Replace RESEARCH.md template**

Replace the entire contents of `templates/RESEARCH.md` with:

```markdown
# Market Research: [Idea Name]

## Pain Validation
- **Signal Strength:** [Strong / Moderate / Weak]
- **Confidence:** [High / Medium / Low]
- **Sources Analyzed:** [count] across [platforms]
- **Key Findings:**
  - **Claim:** [finding]
    - **Source:** [URL]
    - **Platform:** [platform]
    - **Engagement:** [metrics]
    - **Confidence:** [level]
- **Representative Quotes:**
  > "[Quote]" — [source URL], [date]
- **Pain Frequency:** [X mentions across Y sources in Z timeframe]

## Market Size
- **TAM:** $[X] ([methodology]) — **Source:** [URL]
- **SAM:** $[X] ([segment definition]) — **Source:** [URL]
- **SOM (Year 1):** $[X] ([assumptions]) — **Source:** [URL]
- **Confidence:** [High / Medium / Low]
- **Data Sources:** [list with URLs]

## Estimated Maintenance Cost (Zero Users)

### Tech Stack Estimate
- **Hosting:** $X-Y/mo (based on [reasoning])
- **Database:** $X-Y/mo
- **Third-party APIs:** $X-Y/mo
- **Domain + DNS:** $X-Y/mo
- **Total range:** $X-Y/mo
- **Confidence:** [High / Medium / Low]
- **Assumptions:** [what the estimate is based on]

### Budget Check
- **Founder's stated budget:** $Z/mo (from IDEA.md)
- **Status:** [Budget covers estimated range / Budget is tight / Budget insufficient]

## Scoring Inputs

### Pain Intensity
- **gsr-researcher suggests:** [X/5]
- **Reasoning:** [evidence summary]
- **Key evidence:** [top 3 sources with URLs]

### Willingness to Pay
- **gsr-researcher suggests:** [X/5]
- **gsr-competitor-analyst suggests:** [X/5]
- **Reasoning:** [evidence summary from each]

### Market Size
- **gsr-market-sizer suggests:** [X/5]
- **Reasoning:** [evidence summary]

### Competition
- **gsr-competitor-analyst suggests:** [X/5]
- **Reasoning:** [evidence summary]

### Timing
- **gsr-researcher suggests:** [X/5]
- **gsr-market-sizer suggests:** [X/5]
- **Reasoning:** [evidence summary from each]

## Converging Signals
- [Findings supported by 2+ agents, with sources]

## Contradictions
- [Disagreements between agents with both sides cited]

## Research Coverage
[Merged coverage tables from all agents — searches per platform/source]

## Research Gaps & Recommended Actions

| Gap | Scoring Dimension at Risk | Suggested Action |
|-----|--------------------------|-----------------|
| [gap] | [dimension] | [action] |
```

- [ ] **Step 2: Commit**

```bash
git add templates/RESEARCH.md
git commit -m "feat(template): update RESEARCH.md with scoring inputs, evidence format, and maintenance cost"
```

---

### Task 14: Update CHANGELOG for v0.2.1

**Files:**
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Add v0.2.1 entry**

In `CHANGELOG.md`, add after the `## [0.2.0]` header line (before its `### Added`):

```markdown
## [0.2.1] - 2026-03-17

### Added
- Structured evidence format — every claim requires source URL, platform, engagement, and confidence
- Agent self-review step — flags unverified claims before writing output
- Search budget constraints — minimum platform coverage, maximum search limits per agent
- Scoring input sections — research output aligned to 7 scoring dimensions
- Smart merge — deduplication, cross-referencing, contradiction detection, signal reinforcement
- Actionable research gaps — each gap linked to scoring dimension with suggested founder action
- Estimated maintenance cost — tech stack cost range + budget check from founder interview
- Monthly Runway Budget question in idea interview

### Changed
- RESEARCH.md template restructured with new sections: Scoring Inputs, Converging Signals, Contradictions, Research Coverage, Research Gaps
- IDEA.md template includes Monthly Runway Budget field

```

- [ ] **Step 2: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs: add CHANGELOG entry for v0.2.1"
```

---

## Chunk 3: Phase 3 — Reverse Engineer + UX (v0.2.2)

### Task 15: Add progress callbacks to research workflow

**Files:**
- Modify: `workflows/research.md` (Steps 2, 3, 4, 5)

- [ ] **Step 1: Add status messages to workflow steps**

In `workflows/research.md`:

After the probe gate (Step 2) succeeds, add:
```
Display: "Firecrawl verified. Spawning 3 research agents..."
```

At the start of Step 4 (Smart Merge), add:
```
Display: "All agents complete. Pain researcher: X sources. Competitor analyst: Y sources. Market sizer: Z sources. Merging and cross-referencing results..."
```
(Read each agent's output file to count sources before displaying.)

These are already implicit in the workflow but making them explicit instructions.

- [ ] **Step 2: Commit**

```bash
git add workflows/research.md
git commit -m "feat(workflow): add progress status messages during research"
```

---

### Task 16: Add Firecrawl probe gate to reverse workflow

**Files:**
- Modify: `workflows/reverse.md` (between Step 1 and Step 2)

- [ ] **Step 1: Insert probe gate**

In `workflows/reverse.md`, after Step 1 (Initialize State) and before Step 2 (Parse Competitor Input), insert:

```markdown

## Step 1b: Firecrawl Probe Gate

Make a lightweight `mcp__firecrawl__scrape` call against `https://example.com`.

**If the call fails** (tool not found, connection error, any error):
Abort the workflow with:
"Firecrawl plugin required for reverse analysis.

GetShitRight uses Firecrawl for reliable web scraping — without it, competitor research may contain hallucinated sources and unverifiable claims.

Install it free from the Plugin Marketplace:
  /plugin → select firecrawl → /reload-plugins

Then re-run /val:reverse."

**If the call succeeds:** proceed to Step 2.
```

- [ ] **Step 2: Commit**

```bash
git add workflows/reverse.md
git commit -m "feat(workflow): add Firecrawl probe gate to reverse workflow"
```

---

### Task 17: Add structured scraping targets to competitor analyst deep mode

**Files:**
- Modify: `agents/gsr-competitor-analyst.md` (Deep Single-Product Mode section)

- [ ] **Step 1: Add scraping checklist**

In `agents/gsr-competitor-analyst.md`, in the Deep Single-Product Mode section, after "1. Research the product thoroughly:" replace the sub-list with:

```markdown
1. Research the product using this mandatory scraping checklist:
   - Product website — homepage + pricing page (`mcp__firecrawl__scrape`)
   - G2 reviews — "[competitor] reviews site:g2.com" (`mcp__firecrawl__search`)
   - Capterra reviews — "[competitor] reviews site:capterra.com" (`mcp__firecrawl__search`)
   - Reddit discussions — "[competitor] site:reddit.com" (`mcp__firecrawl__search`)
   - Crunchbase — "[competitor] crunchbase" for funding/employee data (`mcp__firecrawl__search`)
   - LinkedIn — "[competitor] LinkedIn" for employee count signal (`mcp__firecrawl__search`)
   - Twitter/X — "[competitor] complaints OR alternative OR switching" (`mcp__firecrawl__search`)
   Must attempt all 7 targets. Report which succeeded and which returned no results.
```

- [ ] **Step 2: Commit**

```bash
git add agents/gsr-competitor-analyst.md
git commit -m "feat(agent): add structured scraping targets for deep competitor analysis"
```

---

### Task 18: Add evidence, moat, and confidence to REVERSE-ANALYSIS.md template

**Files:**
- Modify: `templates/REVERSE-ANALYSIS.md`

- [ ] **Step 1: Update the Spin-off Angles section**

In `templates/REVERSE-ANALYSIS.md`, replace the entire `## Spin-off Angles` section (lines 16-32, including the heading) with:

```markdown
## Spin-off Angles

### Angle 1: [Name]
- **Target:** [Specific segment the competitor ignores]
- **Gap exploited:** [What's missing/broken for this segment]
- **Hook:** [One-sentence differentiation]
- **Evidence:**
  - [Review theme with URL] (X mentions across Y reviews)
  - [Reddit thread with URL] (Z upvotes)
  - [Feature request with URL]
- **Evidence strength:** Strong / Moderate / Weak
- **Moat assessment:** Easy / Medium / Hard for competitor to replicate
- **Moat reasoning:** [Why — e.g., "requires deep integration with X that competitor has deprioritized for 2+ years"]
- **Confidence score:** [1-5]
  - Evidence strength: [1-5]
  - Segment size signal: [1-5]
  - Moat durability: [1-5]

### Angle 2: [Name]
[Same structure as Angle 1]

### Angle 3: [Name]
[Same structure as Angle 1]
```

- [ ] **Step 2: Commit**

```bash
git add templates/REVERSE-ANALYSIS.md
git commit -m "feat(template): add evidence, moat check, and confidence scoring to reverse analysis angles"
```

---

### Task 19: Update competitor analyst agent for angle enhancements

**Files:**
- Modify: `agents/gsr-competitor-analyst.md` (Deep Mode output instructions)

- [ ] **Step 1: Update Deep Mode spin-off angle instructions**

In `agents/gsr-competitor-analyst.md`, in the Deep Single-Product Mode section, replace the spin-off angle generation instructions (section 4, lines 58-61) with:

```markdown
4. Generate 2-3 spin-off angles, each with:
   - Target segment the competitor ignores
   - Gap being exploited (with evidence URLs)
   - One-sentence differentiation hook
   - Evidence: cite specific review themes with URLs and engagement counts
   - Evidence strength: Strong (3+ sources) / Moderate (2 sources) / Weak (1 or inference)
   - Moat assessment: Easy / Medium / Hard for competitor to replicate, with reasoning
   - Confidence score (1-5): average of Evidence strength (1-5), Segment size signal (1-5), Moat durability (1-5)

   Angles with "Weak" evidence strength: flag as "This angle is speculative — validate manually before pursuing."
   Angles with "Easy" moat: flag as "Competitor could close this gap quickly. Only pursue if you can establish lock-in before they react."
```

- [ ] **Step 2: Commit**

```bash
git add agents/gsr-competitor-analyst.md
git commit -m "feat(agent): add evidence-backed angles with moat check and confidence scoring"
```

---

### Task 20: Update reverse workflow for ranked angle presentation

**Files:**
- Modify: `workflows/reverse.md` (Steps 4-5)

- [ ] **Step 1: Update Step 4 (Present Angles)**

In `workflows/reverse.md`, replace the Step 4 presentation format with:

```markdown
## Step 4: Present Angles

Read `.validation/REVERSE-ANALYSIS.md` and present the spin-off angles ranked by confidence score:

"Based on my analysis of [Competitor], here are 3 spin-off angles (ranked by confidence):

**Angle 1: [Name]** — [Hook] (Confidence: X/5)
**Angle 2: [Name]** — [Hook] (Confidence: X/5)
**Angle 3: [Name]** — [Hook] (Confidence: X/5 ⚠️ speculative if ≤2)

Pick one (1/2/3) or say **Surprise me** and I'll pick the strongest angle."
```

- [ ] **Step 2: Update Step 5 (Select Angle)**

In `workflows/reverse.md`, replace the "Surprise me" logic in Step 5 with:

```markdown
## Step 5: Select Angle

If founder picks a number: use that angle.
If founder says "Surprise me": pick the angle with the highest confidence score.

State why: "I picked Angle [N] because it has the highest confidence score (X/5), backed by [brief evidence summary]."
```

- [ ] **Step 3: Commit**

```bash
git add workflows/reverse.md
git commit -m "feat(workflow): ranked angle presentation with confidence-based 'Surprise me'"
```

---

### Task 21: Update reverse workflow IDEA.md generation to include Monthly Runway Budget

**Files:**
- Modify: `workflows/reverse.md` (Step 6)

- [ ] **Step 1: Add Monthly Runway Budget to IDEA.md generation**

In `workflows/reverse.md`, in Step 6 (Generate IDEA.md), after the `- Pricing Intuition:` line, add:

```markdown
- Monthly Runway Budget: "To be estimated from research"
```

This ensures IDEA.md files generated from reverse analysis include the new field.

- [ ] **Step 2: Commit**

```bash
git add workflows/reverse.md
git commit -m "fix(workflow): include Monthly Runway Budget in reverse-generated IDEA.md"
```

---

### Task 22: Update CHANGELOG for v0.2.2

**Files:**
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Add v0.2.2 entry**

In `CHANGELOG.md`, add after the `## [0.2.1]` header line (before its `### Added`):

```markdown
## [0.2.2] - 2026-03-17

### Added
- Firecrawl probe gate for reverse workflow
- Progress status messages during research workflow
- Structured scraping targets for deep competitor analysis (7 mandatory sources)
- Evidence-backed spin-off angles with source URLs and engagement counts
- Moat check per angle — assesses how hard competitor can replicate
- Angle confidence scoring (1-5 composite: evidence + segment + moat)

### Changed
- REVERSE-ANALYSIS.md template includes evidence, moat, and confidence fields
- "Surprise me" in reverse workflow now picks highest confidence score (replaces heuristic)
- Angles ranked by confidence in presentation

```

- [ ] **Step 2: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs: add CHANGELOG entry for v0.2.2"
```

---

### Task 23: Update VERSION file

**Files:**
- Modify: `VERSION`

- [ ] **Step 1: Update version**

Change `VERSION` from `0.1.0` to `0.2.2`.

- [ ] **Step 2: Commit**

```bash
git add VERSION
git commit -m "chore: bump version to 0.2.2"
```
