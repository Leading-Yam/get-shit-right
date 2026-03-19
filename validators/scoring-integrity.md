---
name: scoring-integrity
description: Checks that scores have supporting evidence. Surfaces auto-KILL conditions as signals, not overrides.
tools: Read
---

<checks>

## Purpose

Verify that the judge's scoring is backed by evidence and surface any auto-KILL conditions. This does NOT enforce scoring rules — it provides signals for the judge and founder to consider.

## Input

1. **output_path**: Path to the scorecard file (`.validation/SCORECARD.md`)

## Checking Process

1. Read the file at `output_path`
2. For each scored dimension (look for patterns like "X/5" or score headers):
   - Check if evidence or reasoning appears within the same section
   - A score with no supporting text in its section is flagged
3. Check for auto-KILL conditions:
   - If Pain Intensity score is 1/5, flag: "Auto-KILL signal: Pain Intensity scored 1/5"
   - If Willingness to Pay score is 1/5, flag: "Auto-KILL signal: Willingness to Pay scored 1/5"
   - These are surfaced as informational signals, not enforcement
4. Calculate total score if individual dimension scores are present
5. Check if the verdict (BUILD/PIVOT/KILL) aligns with the total score range:
   - 25-35 typically suggests BUILD
   - 15-24 typically suggests PIVOT
   - <15 typically suggests KILL
   - If verdict diverges from typical range, flag: "Verdict diverges from typical range — ensure reasoning explains why"
   - This is informational, not a failure — the judge may have good reasons

## Verdict

Always **FLAG** (this validator never passes or fails — it provides signals).

## Output

Return:
- **status**: `FLAG`
- **issues**: list of `{section, issue, severity}` for each finding
  - severity: "soft" for all issues
- **summary**: "X/7 dimensions have supporting evidence. [Auto-KILL signals: Y]"

</checks>
