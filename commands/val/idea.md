---
name: val:idea
description: Interview to capture & structure your SaaS idea
allowed-tools:
  - Read
  - Write
  - Glob
  - AskUserQuestion
  - Agent
---

<objective>
Conduct an adaptive interview (max 6 questions) to extract the founder's SaaS idea
and produce a structured .validation/IDEA.md file.

Questions 2-5 offer "Surprise me" for founders who want smart defaults.
Questions 1 (core idea) and 6 (riskiest assumption) are mandatory.
</objective>

<execution_context>
@workflows/idea.md
@workflows/state.md
</execution_context>

<context>
Arguments: $ARGUMENTS (optional — if provided, used as the idea one-liner for Question 1)
</context>

<process>
Follow the idea workflow from @workflows/idea.md end-to-end.

If $ARGUMENTS is provided, use it as the answer to Question 1 and skip asking it.

Dispatch the gsr-interviewer agent for the interactive interview.
</process>
