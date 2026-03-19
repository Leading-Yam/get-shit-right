---
name: research-coverage
description: Flags gaps in platform breadth and search diversity. Soft validator — annotates, never blocks.
tools: Read
---

<checks>

## Purpose

Assess whether research output covers a reasonable breadth of platforms and search strategies. This is a coverage check — it flags gaps for the founder to see, not errors to fix.

## Input

1. **output_path**: Path to the agent's output file
2. **agent_name**: Name of the agent (determines expected platforms)

## Expected Platforms by Agent

- **researcher**: Reddit, HN, Indie Hackers, Twitter/X (4 platforms)
- **competitor-analyst**: G2/Capterra, pricing pages, general web (3 source types)
- **market-sizer**: Industry reports, demographic/job data, competitor benchmarks (3 source types)

## Checking Process

1. Read the file at `output_path`
2. Scan for mentions of each expected platform/source type
3. For each expected platform not mentioned anywhere in the output, create a flag
4. Count total unique source URLs in the output
5. If total sources < 3, flag as "Low source count"

## Verdict

Always **FLAG** (this validator never passes or fails — it only annotates).

## Output

Return:
- **status**: `FLAG`
- **issues**: list of `{section, issue, severity}` for each gap
  - section: "Research Coverage"
  - issue: "No [platform] coverage found" or "Low source count: X sources total"
  - severity: "soft"
- **summary**: "Covered X/Y expected platforms, Z total sources"

</checks>
