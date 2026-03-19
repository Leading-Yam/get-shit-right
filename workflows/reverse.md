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
