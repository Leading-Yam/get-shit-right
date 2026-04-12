---
name: gsr:outcome
description: Log what happened to a past BUILD/PIVOT/KILL verdict
allowed-tools:
  - Read
  - Write
  - Glob
  - AskUserQuestion
---

<objective>
Resolve pending outcome-ledger entries after an idea plays out, so future `/gsr:score` runs can use personal calibration priors.
</objective>

<execution_context>
@outcome-workflow.md
@state-workflow.md
</execution_context>

<context>
Arguments: $ARGUMENTS (optional; headless form: `slug=<idea_slug> status=<shipped|killed|pivoted> lesson=<one-line lesson>`)

Environment variables:
- `GSR_NO_LEDGER=<any non-empty value>` disables the ledger entirely. `GSR_NO_LEDGER=0` and `GSR_NO_LEDGER=false` also disable; unset it to re-enable.
- `GSR_NONINTERACTIVE=1` suppresses prompts and requires headless arguments.
- `GSR_LEDGER_PATH=<path>` overrides `~/.gsr/outcomes.md`, primarily for tests or locked-down home directories.

Privacy warning: lessons are stored unencrypted in `~/.gsr/outcomes.md` and will be read by future GSR agents. Do not paste secrets, API keys, or NDA content.
</context>

<process>
Follow the outcome workflow from @outcome-workflow.md end-to-end.
</process>
