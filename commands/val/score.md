---
name: val:score
description: Evidence-based viability scorecard with default-kill philosophy
allowed-tools:
  - Read
  - Write
  - Glob
  - Agent
---

<objective>
Score the idea across 7 dimensions (Pain Intensity, Willingness to Pay, Competition
Density, Differentiation Clarity, Founder-Market Fit, Build Complexity, Distribution
Clarity). Each dimension 1-5 with cited evidence. BUILD requires 25+/35. 1/5 on Pain
or WTP triggers automatic KILL.
</objective>

<execution_context>
@workflows/score.md
@workflows/state.md
</execution_context>

<context>
Arguments: $ARGUMENTS (none expected)

Prerequisites:
- Required: .validation/IDEA.md
- Recommended: .validation/RESEARCH.md, .validation/COMPETITORS.md
</context>

<process>
Follow the score workflow from @workflows/score.md end-to-end.
Dispatch gsr-judge agent for evidence-based scoring.
</process>
