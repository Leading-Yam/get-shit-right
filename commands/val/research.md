---
name: val:research
description: Parallel market research — pain validation, competitors, market sizing
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Agent
  - WebSearch
  - WebFetch
  - mcp__firecrawl__*
---

<objective>
Spawn 3 parallel research agents to validate pain signals, map the competitive
landscape, and estimate market size. Requires IDEA.md to exist.

Produces .validation/RESEARCH.md and .validation/COMPETITORS.md with confidence
levels on all findings.
</objective>

<execution_context>
@workflows/research.md
@workflows/state.md
</execution_context>

<context>
Arguments: $ARGUMENTS (none expected)

Prerequisites: .validation/IDEA.md must exist (from /val:idea or /val:reverse)
</context>

<process>
Follow the research workflow from @workflows/research.md end-to-end.

Spawn gsr-researcher, gsr-competitor-analyst (standard mode), and gsr-market-sizer
as parallel agents. Merge results and assess research quality.
</process>
