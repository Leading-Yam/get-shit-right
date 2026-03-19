<purpose>
Orchestrate parallel market research by spawning 3 agents concurrently:
pain researcher, competitor analyst, and market sizer.
Detects research tools and merges results into RESEARCH.md and COMPETITORS.md.
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

- If it succeeds: display "Firecrawl detected — enhanced research mode."
- If it fails (tool not found): display "Using built-in web search. Install Firecrawl for deeper research: https://firecrawl.dev"
- Continue either way — never abort.

Display: "Spawning 3 research agents..."

## Step 3: Spawn Parallel Research Agents

Read `.validation/IDEA.md` to prepare context for all agents.

Spawn 3 agents concurrently:

**Agent 1: gsr-researcher (Pain Validation)**
- Provide: IDEA.md content
- Task: Search Reddit, HN, Indie Hackers, Twitter/X for pain signals
- Output: `.validation/RESEARCH-PAIN.md` (temporary)

**Agent 2: gsr-competitor-analyst (Standard Mode)**
- Provide: IDEA.md content
- Task: Map competitive landscape, find gaps
- Output: `.validation/COMPETITORS.md`

**Agent 3: gsr-market-sizer (Market Estimation)**
- Provide: IDEA.md content
- Task: Estimate TAM/SAM/SOM with conservative methodology
- Output: `.validation/RESEARCH-MARKET.md` (temporary)

Wait for all 3 agents to complete.

## Step 4: Smart Merge

Display: "All agents complete. Pain researcher: X sources. Competitor analyst: Y sources. Market sizer: Z sources. Merging and cross-referencing results..."
(Read each agent's output file to count sources before displaying.)

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

Ensure `.validation/COMPETITORS.md` is complete.

## Step 5: Research Quality Summary

Read the merged `.validation/RESEARCH.md` and report:
- Total verified sources across all agents
- Number of research gaps identified
- Number of contradictions found between agents
- Any agents that failed to produce output

Display: "Research complete. [X verified sources, Y gaps, Z contradictions found]"

## Step 6: Update State

Update `.validation/STATE.md`:
- Check `research` step with today's date
- Keep `Current Status` as `IN_PROGRESS`

## Step 7: Next Steps

"Research complete. Results in `.validation/RESEARCH.md` and `.validation/COMPETITORS.md`.

Next: Run `/val:score` for the viability scorecard."

</process>
