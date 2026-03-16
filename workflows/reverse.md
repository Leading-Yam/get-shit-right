<purpose>
Orchestrate reverse engineering of a competitor. Dispatch competitor analyst in deep
single-product mode, present spin-off angles, convert chosen angle to IDEA.md.
</purpose>

<process>

## Step 1: Initialize State

Follow @workflows/state.md to ensure `.validation/STATE.md` exists.
Check for existing completed validation (multi-idea guard).
Check for existing IDEA.md (overwrite protection).

## Step 2: Parse Competitor Input

Read $ARGUMENTS for the competitor name, URL, or app store link.
If no argument provided, ask: "Which competitor do you want to reverse engineer? Provide a name, URL, or app store link."

## Step 3: Deep Competitor Analysis

Dispatch `gsr-competitor-analyst` agent in deep single-product mode.

Provide:
- Competitor identifier from Step 2
- Instruction to produce REVERSE-ANALYSIS.md with 2-3 spin-off angles

Agent writes `.validation/REVERSE-ANALYSIS.md`.

## Step 4: Present Angles

Read `.validation/REVERSE-ANALYSIS.md` and present the spin-off angles to the founder.

"Based on my analysis of [Competitor], here are 3 spin-off angles:

**Angle 1: [Name]** — [Hook]
**Angle 2: [Name]** — [Hook]
**Angle 3: [Name]** — [Hook]

Pick one (1/2/3) or say **Surprise me** and I'll pick the strongest angle."

## Step 5: Select Angle

If founder picks a number: use that angle.
If founder says "Surprise me": pick the angle with the strongest combination of:
1. Largest underserved segment
2. Weakest existing competition
3. Clearest differentiation hook

State why: "I picked Angle [N] because [reasoning]."

## Step 6: Generate IDEA.md

Convert the chosen angle into IDEA.md format:
- One-Liner: derived from the angle's hook
- Target Customer: from the angle's target segment
- Core Hypothesis: "If we build [angle] for [target], they will switch from [competitor] because [gap]"
- Riskiest Assumptions: derived from the gap and segment
- Switching Trigger: from competitor's weakness
- Pricing Intuition: "To be determined from competitive research" (unless obvious from competitor pricing)
- Stated Assumptions: note that this idea was generated from reverse analysis

Write to `.validation/IDEA.md`.

## Step 7: Update State

Update `.validation/STATE.md`:
- Check `reverse` step with today's date
- Also check `idea` step with today's date (since IDEA.md was produced)
- Set `Entry Point` to `reverse`
- Set `Current Status` to `IN_PROGRESS`

## Step 8: Next Steps

"Your reverse analysis is in `.validation/REVERSE-ANALYSIS.md` and the selected angle
is captured in `.validation/IDEA.md`.

Next: Run `/val:research` to validate this angle, or `/val:quick` to run the full pipeline."

</process>
