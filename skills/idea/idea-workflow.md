<purpose>
Orchestrate the idea capture interview. Initialize state, check for existing
validation, dispatch the interviewer agent, validate output, assign a stable idea_slug,
and update state.
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

## Step 3.5: Assign idea_slug

If `GSR_NO_LEDGER` is non-empty, skip this step before any ledger-related slug backfill work. Any non-empty value disables this feature path (`GSR_NO_LEDGER=0` and `GSR_NO_LEDGER=false` both disable; unset to re-enable).

Otherwise assign a stable `idea_slug`:
- Read the IDEA.md `## One-Liner` value.
- Generate `YYYY-MM-DD-<sanitized-kebab>-<sha256(one_liner+timestamp)[:6]>` with `scripts/gsr-outcome-slug.sh`.
- Sanitization must restrict the kebab-name to `[a-z0-9-]{1,40}`, strip leading `#`/`-`, reject newlines, and never write the raw one-liner into the ledger.
- Write `idea_slug: <slug>` under the IDEA title and under `.validation/STATE.md` `## Config`.

If the one-liner cannot be read, use a shell-safe fallback based on the current directory name only: quote `"${PWD##*/}"` and pipe through `tr -cd 'a-z0-9-'`. Do not interpolate unquoted `$(pwd)`.

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
- Preserve `idea_slug: <slug>` in Config when present

## Step 7: Next Steps

"Your idea is captured in `.validation/IDEA.md`.

Next: Run `/gsr:research` to research the market, or `/gsr:quick` to run the full pipeline."

</process>
