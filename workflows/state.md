<purpose>
Manage `.validation/STATE.md` — initialize, read current state, and update step completion.
Called by all commands to track workflow progress.
</purpose>

<process>

## Initializing State

When any `/val:*` command runs and `.validation/STATE.md` does not exist:

1. Create `.validation/` directory if it doesn't exist
2. Copy the STATE.md template to `.validation/STATE.md`
3. Return the initialized state

## Reading State

Read `.validation/STATE.md` and parse:
- `Current Status` — NOT_STARTED / IN_PROGRESS / COMPLETE
- `Steps` — which steps are checked (completed) with dates
- `Entry Point` — idea / reverse / pending
- `Config` — key-value pairs (reserved for future use)

## Updating State

When a command completes successfully:

1. Read current `.validation/STATE.md`
2. Check the completed step's checkbox and add today's date: `- [x] idea — YYYY-MM-DD`
3. Update `Current Status`:
   - If any step is checked but not all → `IN_PROGRESS`
   - If all required steps are checked → `COMPLETE`
4. Update `Entry Point` on first step completion (idea or reverse)
5. Write updated STATE.md back to disk

## Required vs Optional Steps

Required steps for COMPLETE status: idea, research, score, decide
Optional steps (tracked but not required): reverse, skew

When checking if all required steps are complete for COMPLETE status,
only check the required steps. Optional steps are tracked with dates
when completed but do not block the COMPLETE status transition.

## Checking Prerequisites

When a command needs a prerequisite artifact:

1. Read STATE.md to check if prerequisite step is completed
2. If prerequisite is not completed:
   - For hard requirements (e.g., research needs IDEA.md): fail with message
   - For soft requirements (e.g., score without research): warn but proceed
3. Also check if the artifact file actually exists in `.validation/` (founder might have created it manually)

## Overwrite Protection

When a command would overwrite an existing `.validation/` artifact:

1. Check if the artifact file exists
2. If it exists, warn: "This will overwrite your existing [artifact]. Continue? (y/n)"
3. Wait for confirmation before proceeding

## Multi-Idea Guard

When any `/val:*` command starts and `.validation/STATE.md` shows `Current Status: COMPLETE`:

1. Warn: "A completed validation exists. Delete `.validation/` to start fresh, or use git to branch."
2. Wait for confirmation before proceeding

</process>
