<purpose>
Orchestrate Value Array analysis using DeMarco's framework. Determine input mode,
dispatch gsr-value-skewer agent, display results, and update state.
</purpose>

<process>

## Step 1: Initialize State

Follow @workflows/state.md to ensure `.validation/STATE.md` exists.
Check for existing completed validation (multi-idea guard).
Check for existing `.validation/VALUE-SKEW.md` — if it exists, follow the Overwrite Protection process from @workflows/state.md (warn and wait for user confirmation before proceeding).

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

## Step 3: Firecrawl Probe Gate (URL modes only)

If mode is `url_only` or `both`:

Make a lightweight `mcp__firecrawl__scrape` call against `https://example.com`.

**If the call fails** (tool not found, connection error, any error):
Abort the workflow with:
"Firecrawl plugin required for URL-based skew analysis.

GetShitRight uses Firecrawl for reliable web scraping — without it, competitor research may contain hallucinated sources and unverifiable claims.

Install it free from the Plugin Marketplace:
  /plugin → select firecrawl → /reload-plugins

Then re-run `/val:skew <URL>`."

**If the call succeeds:** proceed to Step 4.

For `idea_only` mode: skip this step entirely. Firecrawl is still used for market context searches but is not gate-checked — the agent handles search failures gracefully.

## Step 4: Dispatch Agent

Dispatch the `gsr-value-skewer` agent with:
- **Input mode:** `idea_only`, `url_only`, or `both`
- **URL:** the competitor URL from `$ARGUMENTS` (if provided)
- **IDEA.md contents:** read and pass `.validation/IDEA.md` contents (if exists)

The agent writes `.validation/VALUE-SKEW.md`.

## Step 5: Display Results

Read `.validation/VALUE-SKEW.md` and display to the founder:

1. Show the **Recommended Skew** section prominently:
   "**Recommended Skew: [Axis]** — [The Play]"

2. Show the **CENTS Advisory** verdict:
   "**CENTS Verdict:** [Commodity / Skewable Asset / Already Skewed]"
   Note: "This is informational — it doesn't affect your validation score."

3. If `both` mode, highlight the **Mapping to Your Idea** section.

## Step 6: Update State

Update `.validation/STATE.md`:
- Check `skew` step with today's date: `- [x] skew — YYYY-MM-DD`
- Set `Current Status` to `IN_PROGRESS` if not already

Do NOT update `Entry Point` — skew is a supplementary step, not an entry point.

## Step 7: Next Steps

"Your value skew analysis is in `.validation/VALUE-SKEW.md`."

Then, based on current state:

- If no `.validation/IDEA.md`:
  "Next: Run `/val:idea` to capture your idea, or `/val:reverse` to find spin-off angles."

- If `.validation/IDEA.md` exists but no RESEARCH.md:
  "Next: Run `/val:research` to validate your idea with market data."

- If `.validation/IDEA.md` and RESEARCH.md exist:
  "Next: Run `/val:score` to score your idea."

</process>
