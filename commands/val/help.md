---
name: val:help
description: Show available commands, recommended flows, and current validation state
allowed-tools:
  - Read
  - Glob
  - Bash
---

<objective>
Display the GetShitRight usage guide with command reference, recommended flows,
and current `.validation/` progress.
</objective>

<execution_context>
@workflows/help.md
@workflows/state.md
</execution_context>

<process>
Follow the help workflow from @workflows/help.md.
Read VERSION file for version number.
Read .validation/STATE.md if it exists for current progress.
</process>
