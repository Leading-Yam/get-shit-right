<purpose>
Orchestrate parallel market research by spawning 3 agents concurrently:
pain researcher, competitor analyst, and market sizer.
Handles Firecrawl nudge and merges results into RESEARCH.md and COMPETITORS.md.
</purpose>

<process>

## Step 1: Initialize State & Check Prerequisites

Follow @workflows/state.md to ensure `.validation/STATE.md` exists.

Check for `.validation/IDEA.md`:
- If it does not exist: fail with "Run `/val:idea` or `/val:reverse` first to capture your idea."
- If it exists: proceed

Check for existing research artifacts (overwrite protection).

## Step 2: Firecrawl Nudge

Read `.validation/STATE.md` config section.

If `firecrawl_nudge_shown` is `false`:
- Check if Firecrawl MCP is available (agents will detect via try-and-fallback)
- Display once: "Tip: Install the Firecrawl MCP plugin for deeper research results. GetShitRight works without it, but competitor reviews and Reddit threads are more reliably scraped with it. Run `claude mcp add firecrawl` to set it up."
- Update STATE.md: set `firecrawl_nudge_shown: true`

## Step 2b: Web Search Availability

If all search tool calls fail during agent execution (no WebSearch, no WebFetch, no Firecrawl),
abort the research workflow with: "Web search unavailable. Research requires internet access.
Run `/val:research` when connected."

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

## Step 4: Merge Research Results

Read the temporary files written by the parallel agents:
- `.validation/RESEARCH-PAIN.md` → extract Pain Validation section and gaps
- `.validation/RESEARCH-MARKET.md` → extract Market Size section and gaps

Combine into `.validation/RESEARCH.md`:
- Pain Validation section (from RESEARCH-PAIN.md)
- Market Size section (from RESEARCH-MARKET.md)
- Research Gaps section (merged from both agents' gap lists)

Delete the temporary files:
- `.validation/RESEARCH-PAIN.md`
- `.validation/RESEARCH-MARKET.md`

Ensure `.validation/COMPETITORS.md` is complete.

## Step 5: Research Quality Assessment

Read the merged `.validation/RESEARCH.md` and assess overall quality:

- If Pain Validation confidence is Low AND Market Size confidence is Low:
  Display: "Research signals are weak across the board. Consider validating manually before trusting the scorecard."
- Otherwise: display a brief summary of research quality

## Step 6: Update State

Update `.validation/STATE.md`:
- Check `research` step with today's date
- Keep `Current Status` as `IN_PROGRESS`

## Step 7: Next Steps

"Research complete. Results in `.validation/RESEARCH.md` and `.validation/COMPETITORS.md`.

Next: Run `/val:score` for the viability scorecard."

</process>
