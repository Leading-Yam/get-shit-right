---
name: val:decide
description: Final BUILD / PIVOT / KILL verdict with specific next steps
allowed-tools:
  - Read
  - Write
  - Glob
  - Agent
---

<objective>
Read all validation artifacts and produce the final verdict. BUILD verdicts include
MVP scope, pricing, and first customer recommendations. KILL verdicts always include
alternative angles. BUILD generates CONSTRAINTS.md for optional GSD handoff.
</objective>

<execution_context>
@workflows/decide.md
@workflows/state.md
@workflows/score.md
</execution_context>

<context>
Arguments: $ARGUMENTS (none expected)

Prerequisites:
- Required: .validation/IDEA.md
- Recommended: .validation/SCORECARD.md (will run inline scoring if missing)
</context>

<process>
Follow the decide workflow from @workflows/decide.md end-to-end.

If SCORECARD.md is missing, run inline scoring first via @workflows/score.md.
On BUILD verdict, generate CONSTRAINTS.md and check for GSD installation.
</process>
