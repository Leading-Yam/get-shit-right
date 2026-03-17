# Value Skew Design — `/val:skew`

## Overview

A standalone command that analyzes value delivery through MJ DeMarco's Value Array framework (Scale, Magnitude, Time, Ease, Place) to find "skew" opportunities — points where 10x value can be delivered by dramatically outperforming on a single axis.

**Key distinction from `/val:reverse`:**
- `/val:reverse` asks: "What are they doing wrong? Where are the gaps?"
- `/val:skew` asks: "What if we delivered this 10x better on one axis?"

Reverse finds openings. Skew finds leverage.

## Input Modes

| Mode | Trigger | What happens |
|------|---------|--------------|
| **Idea only** | IDEA.md exists, no URL arg | Skew your own idea's value delivery |
| **URL only** | URL provided, no IDEA.md | Extract competitor features, find skew opportunities |
| **Both** | IDEA.md exists + URL provided | Skew competitor, map opportunities back to your idea |
| **Neither** | No IDEA.md, no URL | Error: "Provide a URL or run /val:idea first" |

## Components

### 1. Command — `commands/val/skew.md`

- YAML frontmatter: name `val:skew`, argument-hint `"<optional competitor URL>"`
- Allowed tools: Read, Write, Bash, Glob, AskUserQuestion, Agent, `mcp__firecrawl__*`
- Delegates to `@workflows/skew.md` and `@workflows/state.md`
- Objective: Analyze value delivery using DeMarco's Value Array to find 10x skew opportunities

### 2. Workflow — `workflows/skew.md`

**Step 1: Initialize State**
- Follow `@workflows/state.md` to ensure `.validation/STATE.md` exists
- Check for existing completed validation (multi-idea guard)

**Step 2: Determine Input Mode**
- Check for `$ARGUMENTS` (URL)
- Check for `.validation/IDEA.md`
- If neither exists: abort with "Provide a competitor URL as an argument, or run `/val:idea` first to capture your idea."
- Set mode: `idea_only`, `url_only`, or `both`

**Step 3: Firecrawl Probe Gate (URL modes only)**
- If mode is `url_only` or `both`: make lightweight `mcp__firecrawl__scrape` call against `https://example.com`
- If fails: abort with Firecrawl install instructions (same pattern as `/val:reverse`)
- If succeeds: proceed

**Step 4: Dispatch Agent**
- Dispatch `gsr-value-skewer` agent with:
  - Input mode
  - URL (if provided)
  - IDEA.md contents (if exists)

**Step 5: Display Results**
- Read `.validation/VALUE-SKEW.md`
- Highlight the Recommended Skew section
- Show CENTS Advisory as informational

**Step 6: Update State**
- Check `skew` step with today's date in STATE.md
- Set `Current Status` to `IN_PROGRESS` if not already

**Step 7: Next Steps**
- "Your value skew analysis is in `.validation/VALUE-SKEW.md`."
- If no IDEA.md yet: "Next: Run `/val:idea` to capture your idea, or `/val:reverse` to find spin-off angles."
- If IDEA.md exists: "Next: Run `/val:research` to validate, or `/val:score` to score your idea."

### 3. Agent — `agents/gsr-value-skewer.md`

**Role:** Value strategist using MJ DeMarco's Value Array framework. Thinks in leverage, not features. Finds the axis where 10x value delivery is possible. No hype — evidence-backed analysis.

**Behavior:**

1. **Feature Extraction (URL modes):**
   - Scrape the competitor URL with `mcp__firecrawl__scrape`
   - Extract all functional features into a feature map
   - For each feature: what it does, how value is currently delivered

2. **Value Array Analysis:**
   Apply each axis to every feature (URL mode) or the idea as a whole (idea mode):

   - **Scale (Reach):** How many people does this affect? Can it be skewed to reach 10x-100x more people? Look for artificial audience limitations.
   - **Magnitude (Depth):** How deeply does it solve the problem? Can the "pain relief" be 10x stronger? Look for surface-level solutions to deep problems.
   - **Time (Speed):** How fast is the result? Can it be made instant? Look for unnecessary delays, manual steps, waiting periods.
   - **Ease (Barrier):** What's the friction to start? Can barrier drop to zero? Look for signup walls, onboarding complexity, prerequisite knowledge.
   - **Place (Environment):** Where is value delivered? Can it meet users where they already are? Look for platform lock-in, desktop-only, or context-switching requirements.

3. **Recommended Skew:**
   - Identify the single axis with the highest leverage
   - Explain the play in 1-2 sentences
   - Back it with evidence

4. **CENTS Advisory (informational):**
   - Map the skew opportunity to DeMarco's CENTS framework
   - Control: Do you own the platform/channel?
   - Entry: How hard for competitors to replicate?
   - Need: How strong is the market signal?
   - Time: Is income detached from your time?
   - Scale: Can it grow without you?
   - Verdict: Commodity / Skewable Asset / Already Skewed
   - No kill trigger — purely advisory

5. **Idea Mapping (both mode only):**
   - Map skew opportunities back to the founder's idea
   - Show how the idea could incorporate the highest-leverage skew

**Evidence rules:** Same confidence calibration as all GSR agents:
- High: 3+ independent sources with URLs
- Medium: 2 sources or 1 authoritative
- Low: 1 source or inference
- Claims without source: tagged `[UNVERIFIED]`

**Search budget:**
- URL mode: 1 scrape (target URL) + up to 8 supplementary searches for context
- Idea mode: up to 8 searches for market context
- Must attempt at least 3 searches before reporting

**Self-review:** Before writing output, verify all claims have sources. If >30% unverified, add warning.

**Output:** `.validation/VALUE-SKEW.md`

### 4. Template — `templates/VALUE-SKEW.md`

```markdown
# Value Skew Analysis: [Subject]

## Input Mode: [Idea Only / URL Only / Idea + Competitor]

## Feature Map
<!-- Only present when URL was analyzed -->
| Feature | What It Does | Current Value Delivery |
|---------|-------------|----------------------|

## Value Array Analysis

### Scale (Reach)
- **Current:** [Who/how many it reaches now]
- **Skew Opportunity:** [How to reach 10x-100x more]
- **Confidence:** [H/M/L] — [evidence]

### Magnitude (Depth)
- **Current:** [How deeply it solves the problem]
- **Skew Opportunity:** [How to solve 10x deeper]
- **Confidence:** [H/M/L] — [evidence]

### Time (Speed)
- **Current:** [Time to value]
- **Skew Opportunity:** [How to make it instant/10x faster]
- **Confidence:** [H/M/L] — [evidence]

### Ease (Barrier)
- **Current:** [Friction to start]
- **Skew Opportunity:** [How to eliminate friction]
- **Confidence:** [H/M/L] — [evidence]

### Place (Environment)
- **Current:** [Where value is delivered]
- **Skew Opportunity:** [Where else it could meet users]
- **Confidence:** [H/M/L] — [evidence]

## Recommended Skew
**Axis:** [The single axis with highest leverage]
**The Play:** [1-2 sentence strategy]
**Why This Axis:** [Evidence-backed reasoning]

## CENTS Advisory
| Dimension | Assessment | Notes |
|-----------|-----------|-------|
| Control | [Own/Rent/None] | [Do you control the platform?] |
| Entry | [Easy/Medium/Hard] | [Barrier to entry for competitors] |
| Need | [Strong/Moderate/Weak] | [Market need signal] |
| Time | [Detached/Semi/Attached] | [Income tied to your time?] |
| Scale | [High/Medium/Low] | [Can it scale without you?] |

**Verdict:** [Commodity / Skewable Asset / Already Skewed]

## Mapping to Your Idea
<!-- Only present when both IDEA.md and URL were available -->
[How the skew opportunities apply to the founder's idea]
```

### 5. STATE.md Update

Add optional `skew` step between `reverse` and `research`:

```markdown
## Steps
- [ ] idea
- [ ] reverse
- [ ] skew
- [ ] research
- [ ] score
- [ ] decide
```

The `skew` step is optional — it does not block any downstream steps.

## What This Doesn't Do

- No kill trigger from CENTS (advisory only, no scoring impact)
- Doesn't replace the scorecard or reverse analysis
- Doesn't require both inputs (works with either IDEA.md or URL)
- No new scoring dimensions added to gsr-judge
- Doesn't modify any existing commands, agents, or workflows

## Integration Points

- `/val:help` should list `/val:skew` with description
- `/val:quick` does NOT include skew (it's supplementary, not core pipeline)
- VALUE-SKEW.md can be read by gsr-judge as supplementary context if it exists, but doesn't affect scoring dimensions
