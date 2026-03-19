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
