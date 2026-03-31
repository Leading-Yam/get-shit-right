<purpose>
Read all validation artifacts and produce the final BUILD/PIVOT/KILL verdict.
Handles missing scorecard by running inline scoring. Generates CONSTRAINTS.md on BUILD.
Uses reasoned judgment — thresholds are advisory.
</purpose>

<process>

## Step 1: Initialize State & Check Prerequisites

Follow @workflows/state.md.

Check for `.validation/IDEA.md`:
- If missing: fail with "Run `/val:idea` or `/val:reverse` first."

Check for `.validation/SCORECARD.md`:
- If missing: warn "No scorecard found. Running inline scoring first..."
  Then follow @workflows/score.md to produce SCORECARD.md before continuing.

Check for existing DECISION.md (overwrite protection).

## Step 2: Read All Artifacts

Read all available `.validation/` files:
- `IDEA.md` (required)
- `RESEARCH.md` (if exists)
- `COMPETITORS.md` (if exists)
- `SCORECARD.md` (required — produced in Step 1 if missing)
- `REVERSE-ANALYSIS.md` (if exists)
- `VALUE-SKEW.md` (if exists)

## Step 3: Read Memory

1. Search MCP Memory for global learnings: `mcp__memory__search_nodes` with query "learning:judge global"
2. Search MCP Memory for project learnings: `mcp__memory__search_nodes` with query "learning:judge {project-id}"
3. Filter, rank, cap at 5, format as `<memory_context>`
4. Increment `run_count`

If MCP Memory unavailable, skip silently.

## Step 4: Produce Verdict

Based on SCORECARD.md assessment and all available evidence, produce the verdict.

The judge's reasoning in SCORECARD.md drives the verdict. The scoring thresholds
(25+ BUILD, 15-24 PIVOT, <15 KILL) are advisory — if the judge argued for a different
conclusion with evidence, respect that reasoning.

### If BUILD (judge recommends BUILD with evidence):
Generate DECISION.md with:
- Verdict summary (2-3 sentences)
- Recommended MVP scope (2-3 features, test riskiest assumption)
- Features NOT in MVP (scope fence)
- Recommended first customer + where to find them
- Pricing recommendation (from competitive data)
- 3 validation milestones before scaling

Also generate `.validation/CONSTRAINTS.md` for GSD handoff.

### If PIVOT (judge identifies potential but significant weaknesses):
Generate DECISION.md with:
- Verdict summary
- What specifically to change and why
- Which dimensions are weak and how to improve
- Suggested re-run instruction

### If KILL (judge finds insufficient evidence for viability):
Generate DECISION.md with:
- Honest, specific reasons
- 2-3 spin-off angles from research (MUST come from actual findings)
- Where energy should go instead

Write `.validation/DECISION.md`.

## Step 5: Validate Output

**Hard validation:**
- Dispatch `validators/output-structure.md` against `.validation/DECISION.md` with template `templates/DECISION.md`
- If FAIL: fix missing sections, retry (max 2)

**Soft validation:**
- Dispatch `validators/evidence-integrity.md` against `.validation/DECISION.md`
- Collect flags (reasoning-heavy verdicts may have fewer citations — that's expected)

## Step 6: Write Memory

1. Store verdict patterns as project memory
2. If a threshold override occurred (e.g., BUILD at 22/35), store as a learning
3. Check for cross-project promotion
4. If MCP Memory unavailable, skip silently

## Step 7: GSD Handoff (BUILD only)

If verdict is BUILD:

1. Write `.validation/CONSTRAINTS.md`
2. Check if GSD is installed:
   - Look for `~/.claude/commands/gsd/` directory
   - If found: "GSD is installed. Run `/gsd:new-project` to start building — it will read your validation constraints automatically."
   - If not found: "Your validation artifacts are in `.validation/`. If you use GSD, it can read these directly. Otherwise, use `CONSTRAINTS.md` as your requirements reference."

## Step 8: Update State

Update `.validation/STATE.md`:
- Check `decide` step with today's date
- Set `Current Status` to `COMPLETE`

## Step 9: Display Verdict

Display the full DECISION.md content to the founder.
Append any validation flags from Step 5.

</process>
