---
name: gsr:quick
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

If IDEA.md already exists (from /gsr:reverse), offers to continue with it.
</objective>

<execution_context>
@quick-workflow.md
@state-workflow.md
@idea-workflow.md
@research-workflow.md
@score-workflow.md
@decide-workflow.md
</execution_context>

<context>
Arguments: $ARGUMENTS (optional — if provided, used as idea one-liner for Question 1)
</context>

<process>
Follow the quick workflow from @quick-workflow.md end-to-end.
This orchestrates idea → research → score → decide in sequence.
</process>
