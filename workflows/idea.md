<purpose>
Orchestrate the idea capture interview. Initialize state, check for existing
validation, dispatch the interviewer agent, and update state on completion.
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

## Step 4: Update State

Update `.validation/STATE.md`:
- Check the `idea` step with today's date
- Set `Entry Point` to `idea`
- Set `Current Status` to `IN_PROGRESS`

## Step 5: Next Steps

Tell the founder:
"Your idea is captured in `.validation/IDEA.md`.

Next: Run `/val:research` to research the market, or `/val:quick` to run the full pipeline."

</process>
