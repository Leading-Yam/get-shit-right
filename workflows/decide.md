<purpose>
Read all validation artifacts and produce the final BUILD/PIVOT/KILL verdict.
Handles missing scorecard by running inline scoring. Generates CONSTRAINTS.md on BUILD.
Detects GSD installation for handoff suggestion.
</purpose>

<process>

## Step 1: Initialize State & Check Prerequisites

Follow @workflows/state.md.

Check for `.validation/IDEA.md`:
- If missing: fail with "Run `/val:idea` or `/val:reverse` first."
- This is a hard requirement — inline scoring also needs IDEA.md, so /val:decide cannot proceed without it.

Check for `.validation/SCORECARD.md`:
- If missing: warn "No scorecard found. Running inline scoring first..."
  Then follow @workflows/score.md to produce SCORECARD.md before continuing.
  This writes SCORECARD.md to disk and updates STATE.md.

Check for existing DECISION.md (overwrite protection).

## Step 2: Read All Artifacts

Read all available `.validation/` files:
- `IDEA.md` (required)
- `RESEARCH.md` (if exists)
- `COMPETITORS.md` (if exists)
- `SCORECARD.md` (required — produced in Step 1 if missing)
- `REVERSE-ANALYSIS.md` (if exists)

## Step 3: Produce Verdict

Based on SCORECARD.md recommendation:

### If BUILD (25+/35, no auto-KILL):
Generate DECISION.md with:
- Verdict summary (2-3 sentences)
- Recommended MVP scope (2-3 features, explicitly test riskiest assumption)
- Features NOT in MVP (scope fence)
- Recommended first customer + where to find them
- Pricing recommendation (from competitive data)
- 3 validation milestones before scaling

Also generate `.validation/CONSTRAINTS.md` for GSD handoff.

### If PIVOT (15-24/35):
Generate DECISION.md with:
- Verdict summary
- What specifically to change and why
- Which dimensions are weak and how to improve them
- Suggested re-run instruction

### If KILL (<15/35 or auto-KILL):
Generate DECISION.md with:
- Honest, specific reasons
- 2-3 spin-off angles from research (MUST come from actual findings)
- Where energy should go instead

Write `.validation/DECISION.md`.

## Step 4: GSD Handoff (BUILD only)

If verdict is BUILD:

1. Write `.validation/CONSTRAINTS.md`
2. Check if GSD is installed:
   - Look for `~/.claude/commands/gsd/` directory
   - If found: "GSD is installed. Run `/gsd:new-project` to start building — it will read your validation constraints automatically."
   - If not found: "Your validation artifacts are in `.validation/`. If you use GSD, it can read these directly. Otherwise, use `CONSTRAINTS.md` as your requirements reference."

## Step 5: Update State

Update `.validation/STATE.md`:
- Check `decide` step with today's date
- Set `Current Status` to `COMPLETE`

## Step 6: Display Verdict

Display the full DECISION.md content to the founder.

</process>
