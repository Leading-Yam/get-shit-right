---
name: val:reverse
description: Reverse engineer a competitor to find spin-off angles
argument-hint: "<competitor name, URL, or app store link>"
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
Deep-dive a competitor product to find weaknesses, underserved segments, and spin-off
opportunities. Produces REVERSE-ANALYSIS.md with 2-3 angles, then converts the
founder's chosen angle into IDEA.md for the standard validation pipeline.
</objective>

<execution_context>
@workflows/reverse.md
@workflows/state.md
</execution_context>

<context>
Arguments: $ARGUMENTS — competitor name, URL, or app store link
</context>

<process>
Follow the reverse workflow from @workflows/reverse.md end-to-end.

Dispatch gsr-competitor-analyst agent in deep single-product mode.
Present spin-off angles and handle "Surprise me" selection.
</process>
