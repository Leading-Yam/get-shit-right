<purpose>
Resolve pending outcome-ledger entries in the user-global ledger so GSR can calibrate future verdicts against reality.
</purpose>

<process>

## Step 1: Follow @workflows/state.md

Follow @workflows/state.md to read local validation state when present. The ledger is user-global, so a local `.validation/` directory is helpful but not required.

## Step 2: Apply Ledger Guard

If `GSR_NO_LEDGER` is non-empty, stop immediately before any ledger file I/O and display:
"Outcome ledger disabled by GSR_NO_LEDGER. Unset it to re-enable."

Any non-empty value disables the ledger. `GSR_NO_LEDGER=0` and `GSR_NO_LEDGER=false` still disable.

Use `GSR_LEDGER_PATH` if set; otherwise use `~/.gsr/outcomes.md`.

## Step 3: Warn About Sensitive Data

Display once before collecting a lesson:
"Lessons are stored unencrypted in `~/.gsr/outcomes.md` and will be read by future GSR agents. Do not paste secrets, API keys, or NDA content."

## Step 4: Choose Interactive or Headless Mode

If `GSR_NONINTERACTIVE` is non-empty:
- Parse `$ARGUMENTS` for `slug=<idea_slug>`, `status=<shipped|killed|pivoted>`, and `lesson=<one-line lesson>`.
- Do not prompt.
- If any required argument is missing or invalid, fail with a concise usage message.

If `GSR_NONINTERACTIVE` is empty:
- Read the ledger and list pending entries as `idea_slug — verdict — scored_on`.
- If no pending entries exist, display "No pending GSR outcomes found." and stop.
- Ask the founder to choose an entry.
- Ask for the actual outcome: `shipped`, `killed`, or `pivoted`.
- Ask for a one-line lesson.

## Step 5: Validate Inputs

Validate before writing:
- `idea_slug` matches `YYYY-MM-DD-<sanitized-kebab>-<sha256(one_liner+timestamp)[:6]>`.
- `status` is exactly `shipped`, `killed`, or `pivoted`.
- `lesson` is one line, control characters stripped, and truncated to 200 characters before any future injection.
- Never write raw one-liner text into the ledger.

## Step 6: Update Ledger Entry

Update the selected entry in place. When shell helper access is available, use `scripts/gsr-outcome-resolve.sh "<idea_slug>" "<status>" "<lesson>" "<today>"`; otherwise perform the same structured update with Read/Write.

- Preserve the original `Verdict` and `Scored on` fields.
- Change `Status` to the selected actual outcome.
- Change `Resolved on` to today's `YYYY-MM-DD` date.
- Change `Lesson` to the sanitized one-line retrospective.

Keep the locked 6-field entry format. Do not add `schema_version`, `source`, `idea_type`, or any extra fields.

If available in the execution environment, write atomically with temp-file + rename, refuse symlinked ledger paths, refuse world-writable existing ledgers, and preserve mode `0600`. If those filesystem checks are unavailable because this skill intentionally has no Bash tool, do not invent a check; tell the user to inspect the ledger path manually before proceeding with sensitive lessons.

## Step 7: Display Result

Display:
"Outcome logged for `<idea_slug>`. Future `/gsr:score` runs will use it once at least 3 resolved outcomes exist."

</process>
