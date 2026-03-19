---
name: evidence-integrity
description: Checks that factual claims in agent output have source URLs. Fails if >30% unverified.
tools: Read
---

<checks>

## Purpose

Verify that an agent's factual claims are backed by source URLs. This is a correctness check — it does not judge the quality or relevance of evidence, only that claims are sourced.

## Input

1. **output_path**: Path to the agent's output file
2. **agent_name**: Name of the agent that produced the output (for context in issue messages)

## Checking Process

1. Read the file at `output_path`
2. Identify all factual claims — statements that assert something about the external world:
   - Market data, statistics, user counts, revenue figures
   - Competitor features, pricing, funding
   - User quotes, thread counts, engagement metrics
   - Platform availability, tool behavior
3. For each claim, check whether a source URL appears within 3 lines (before or after)
4. Claims without a nearby source URL: tag as `[UNVERIFIED]`
5. Calculate: `unverified_rate = unverified_count / total_claims`

## Verdict

- **PASS**: `unverified_rate <= 0.30` (70%+ of claims have sources)
- **FAIL**: `unverified_rate > 0.30`

## Output

Return:
- **status**: `PASS` or `FAIL`
- **issues**: list of `{section, issue, severity}` for each unverified claim
  - section: the markdown heading the claim appears under
  - issue: "Claim '[first 60 chars...]' has no source URL"
  - severity: "hard"
- **summary**: "X/Y claims verified (Z% coverage)"

</checks>
