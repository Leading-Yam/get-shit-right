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
- If it fails (tool not found, error, or timeout): set tool_context to "Use `WebSearch` for discovery and `WebFetch` for content extraction."

**CRITICAL: Firecrawl is optional. You MUST continue with WebSearch/WebFetch if Firecrawl is unavailable. NEVER abort, block, or ask the user to install Firecrawl. Proceed to Step 3 immediately.**

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
