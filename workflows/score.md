<purpose>
Dispatch the judge agent to score the idea across 7 dimensions.
Handles missing prerequisites gracefully.
</purpose>

<process>

## Step 1: Initialize State & Check Prerequisites

Follow @workflows/state.md.

Check for `.validation/IDEA.md`:
- If missing: fail with "Run `/val:idea` or `/val:reverse` first."

Check for `.validation/RESEARCH.md`:
- If missing: warn "No research data found. Scoring with limited evidence — research-dependent dimensions will be scored conservatively at 2/5. Run `/val:research` first for better results."
- Proceed anyway.

Check for existing SCORECARD.md (overwrite protection).

## Step 2: Dispatch Judge Agent

Dispatch `gsr-judge` agent with available artifacts:
- `.validation/IDEA.md` (always)
- `.validation/RESEARCH.md` (if exists)
- `.validation/COMPETITORS.md` (if exists)
- `.validation/REVERSE-ANALYSIS.md` (if exists)

Agent writes `.validation/SCORECARD.md`.

## Step 3: Display Results

Read `.validation/SCORECARD.md` and display the scorecard to the founder.

Highlight:
- Overall score and recommendation
- Any auto-KILL triggers
- Top red flags

## Step 4: Update State

Update `.validation/STATE.md`:
- Check `score` step with today's date

## Step 5: Next Steps

If recommendation is BUILD or PIVOT:
"Run `/val:decide` for the full verdict with specific next steps."

If recommendation is KILL:
"Run `/val:decide` for the full verdict — it will include alternative angles worth exploring."

</process>
