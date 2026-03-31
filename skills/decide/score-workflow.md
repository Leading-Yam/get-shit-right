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
