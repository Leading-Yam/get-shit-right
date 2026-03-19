<purpose>
Orchestrate the idea capture interview. Initialize state, check for existing
validation, dispatch the interviewer agent, validate output, and update state.
</purpose>

<process>

## Step 1: Initialize State

Follow @workflows/state.md to ensure `.validation/STATE.md` exists.

## Step 2: Check for Existing Validation

If `.validation/STATE.md` shows `Current Status: COMPLETE`:
- Warn: "A completed validation exists. Delete `.validation/` to start fresh, or use git to branch."
- Wait for confirmation.

If `.validation/IDEA.md` already exists:
- Warn: "An existing idea was found. This will overwrite it. Continue? (y/n)"
- Wait for confirmation.

## Step 3: Run Interview

Dispatch the `gsr-interviewer` agent.

The agent handles:
- All 6 questions (with adaptive skipping and "Surprise me")
- Synthesis into IDEA.md format
- Founder review and adjustment
- Writing `.validation/IDEA.md`

Note: The interviewer does not receive memory context (it's a conversational agent,
not a research agent). Memory write happens after validation.

## Step 4: Validate Output

**Hard validation:**
- Dispatch `validators/output-structure.md` against `.validation/IDEA.md` with template `templates/IDEA.md`
- If FAIL: feed issues back to interviewer, retry (max 2)
- If still FAIL: warn founder and continue

## Step 5: Write Memory

Store project learnings from the interview:
- If founder used "Surprise me" on multiple questions, store as project learning
  (category: `success-pattern`, signal: "Founder deferred N questions to inference")
- If founder struggled to articulate switching trigger or riskiest assumption, store
  (category: `failure-mode`, signal: "Founder couldn't articulate [field]")

If MCP Memory unavailable, skip silently.

## Step 6: Update State

Update `.validation/STATE.md`:
- Check the `idea` step with today's date
- Set `Entry Point` to `idea`
- Set `Current Status` to `IN_PROGRESS`

## Step 7: Next Steps

"Your idea is captured in `.validation/IDEA.md`.

Next: Run `/val:research` to research the market, or `/val:quick` to run the full pipeline."

</process>
