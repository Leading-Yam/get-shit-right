---
name: val:quick
description: Full validation pipeline in one command — idea, research, score, decide
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - WebSearch
  - WebFetch
  - AskUserQuestion
  - Agent
  - mcp__firecrawl__*
---

<objective>
Run the complete validation pipeline: interview → parallel research → scoring → verdict.
One command, full BUILD/PIVOT/KILL decision. Pauses only for the initial interview.

If IDEA.md already exists (from /val:reverse), offers to continue with it.
</objective>

<execution_context>
@workflows/quick.md
@workflows/state.md
@workflows/idea.md
@workflows/research.md
@workflows/score.md
@workflows/decide.md
</execution_context>

<context>
Arguments: $ARGUMENTS (optional — if provided, used as idea one-liner for Question 1)
</context>

<process>
Follow the quick workflow from @workflows/quick.md end-to-end.
This orchestrates idea → research → score → decide in sequence.
</process>
