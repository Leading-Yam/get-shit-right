<purpose>
Run the full validation pipeline in one command: idea → research → score → decide.
Detects existing IDEA.md from /val:reverse and offers to continue.
Pauses only for the initial interview.
</purpose>

<process>

## Step 1: Initialize State

Follow @workflows/state.md to ensure `.validation/STATE.md` exists.
Check for completed validation (multi-idea guard).

## Step 2: Check for Existing IDEA.md

If `.validation/IDEA.md` exists:
- Display: "Found an existing idea: [read one-liner from IDEA.md]"
- Ask: "Continue with this idea, or start fresh? (continue/fresh)"
- If "fresh": delete existing `.validation/` artifacts, re-initialize STATE.md
- If "continue": skip to Step 4

## Step 3: Run Interview (if no IDEA.md)

Display: "Step 1/4: Capturing your idea..."

Follow @workflows/idea.md for the interview.
Wait for completion before proceeding.

## Step 4: Run Research

Display: "Step 2/4: Researching the market (3 agents in parallel)..."

Follow @workflows/research.md for parallel research.
Wait for all agents to complete.

## Step 5: Run Scoring

Display: "Step 3/4: Scoring viability..."

Follow @workflows/score.md for evidence-based scoring.

## Step 6: Run Decision

Display: "Step 4/4: Producing verdict..."

Follow @workflows/decide.md for final verdict.

## Step 7: Summary

Display the final verdict from `.validation/DECISION.md`.

</process>
