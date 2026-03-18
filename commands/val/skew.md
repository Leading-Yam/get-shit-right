---
name: val:skew
description: Analyze value delivery to find 10x skew opportunities
argument-hint: "<optional competitor URL>"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - AskUserQuestion
  - Agent
  - mcp__firecrawl__*
---

<objective>
Analyze value delivery using MJ DeMarco's Value Array framework (Scale, Magnitude,
Time, Ease, Place) to find "skew" opportunities — points where 10x value can be
delivered by dramatically outperforming on a single axis.

Works with your idea alone, a competitor URL alone, or both together.
</objective>

<execution_context>
@workflows/skew.md
@workflows/state.md
</execution_context>

<context>
Arguments: $ARGUMENTS — optional competitor URL
</context>

<process>
Follow the skew workflow from @workflows/skew.md end-to-end.

Dispatch gsr-value-skewer agent with the determined input mode.
Display the Recommended Skew and CENTS Advisory to the founder.
</process>
