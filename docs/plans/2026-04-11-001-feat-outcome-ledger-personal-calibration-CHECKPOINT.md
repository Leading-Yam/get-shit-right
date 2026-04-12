---
title: Checkpoint — Outcome Ledger + Personal Calibration
plan: docs/plans/2026-04-11-001-feat-outcome-ledger-personal-calibration-plan.md
brainstorm: docs/brainstorms/2026-04-11-outcome-ledger-brainstorm.md
status: ready-for-implementation
handoff_to: codex
last_updated: 2026-04-12
---

# Handoff Checkpoint — Read This First

**For the agent picking this up (Codex via `/ce:work`):** the brainstorm and the deepened plan are the source of truth. Do not re-plan. Read them in this order, then start Phase 1.

1. `docs/brainstorms/2026-04-11-outcome-ledger-brainstorm.md` — the WHY (6 resolved decisions, 0 open questions)
2. `docs/plans/2026-04-11-001-feat-outcome-ledger-personal-calibration-plan.md` — the WHAT/HOW. **Scroll to the bottom: `## Deepening Review — 2026-04-12` supersedes earlier sections where they conflict.** Anything the deepening marks "ACCEPTED" or "MANDATORY" is binding; anything it marks "REJECTED" stays rejected even if the earlier plan body still mentions it.

## State of play

- **Done:** brainstorm → plan → deepen-plan. Five reviewers (architecture, security-sentinel, pattern-recognition, performance-oracle, code-simplicity) synthesized into the Deepening Review.
- **Not done:** zero lines of implementation code. Nothing in `agents/`, `skills/`, `templates/`, or `~/.gsr/` has been touched for this feature.
- **Scope collapsed from 6 phases → 3.** Use the revised 3-phase breakdown in the Deepening Review, not the original 6-phase list above it.

## The 3 Phases (from Deepening Review — this is what to execute)

### Phase 1 — Slug foundation + ledger I/O
- Add `idea_slug` field to `templates/IDEA.md` and `templates/STATE.md`
- Slug generator: `YYYY-MM-DD-<sanitized-kebab>-<sha256(one_liner+timestamp)[:6]>`
- Write `/gsr:outcome` skill + `skills/outcome/outcome-workflow.md`
- Ledger path: `~/.gsr/outcomes.md` (honor `GSR_LEDGER_PATH` override)
- 6-field entry format (locked — no extras):
  ```
  ## <idea_slug>

  - **Verdict:** BUILD | PIVOT | KILL
  - **Scored on:** YYYY-MM-DD
  - **Status:** pending | shipped | killed | pivoted
  - **Resolved on:** YYYY-MM-DD | —
  - **Lesson:** [one-line retrospective]
  ```
- Pending-write hook in `skills/score/score-workflow.md` Step 7.5 appends `status: pending` entry on every verdict
- **Shadow files to edit in lockstep:** `skills/score/score-workflow.md`, `skills/quick/score-workflow.md`, `skills/decide/score-workflow.md` (verify byte-identity with `diff -q` after edits — this is a hard quality gate)

### Phase 2 — Calibration loop
- New bash digest script: deterministic parse of `~/.gsr/outcomes.md` → compact prior summary (JSON or key:value). No LLM here.
- New `gsr-calibrator` agent: thin prose-over-digest. `tools:` intentionally empty. Reads digest from stdin/context, emits priors in the mandatory citation format:
  ```
  Prior: <claim>. Evidence: <slugs>. Confidence: H|M|L
  ```
- Wire calibrator into `skills/score/score-workflow.md` Step 3.5 (before gsr-judge dispatch)
- N < 3 → calibrator exits silent (no priors injected). Compounding begins at verdict #3.
- Integrate priors into gsr-judge via new `## Personal Calibration` h2 between `## How You Think` and `## Verdicts` in `agents/gsr-judge.md`

### Phase 3 — Hardening, nudge, tests
- **60-day nudge** (Step 0.5 in score-workflow): scan ledger for `status: pending` entries older than 60 days; one-line reminder only. Suppress entirely when `GSR_NONINTERACTIVE=1`.
- **Prompt-injection defense:** wrap all ledger `Lesson:` content in `<untrusted_user_notes>` tags with a distrust preamble before the calibrator / judge ever sees it. This is HIGH-severity from security-sentinel — do not skip.
- **Opt-out:** `GSR_NO_LEDGER=1` — first-line guard in every workflow step that touches the ledger (write, read, nudge, digest). Must short-circuit before any file I/O.
- **Umask + symlink check:** Step 0 in score-workflow. Refuse to write if `~/.gsr/outcomes.md` is a symlink or world-writable.
- **Agent-native parity:** `/gsr:outcome` must have a headless mode (accept args, no interactive prompts) so agents can log outcomes without a human in the loop.
- **Tests:** parity diff across 3 shadow score-workflows; slug determinism; `GSR_NO_LEDGER` short-circuit; nudge suppression under `GSR_NONINTERACTIVE=1`; `<untrusted_user_notes>` wrapping round-trip.

## Binding constraints (do NOT relitigate)

- Ledger lives at `~/.gsr/outcomes.md` (user-global, cross-project). Not in `.validation/`.
- Calibration threshold: N=3. Below it, silent collection only.
- Calibrator = thin prose agent. Digest = deterministic bash. Do not merge them.
- Every calibrator output cites evidence slugs + confidence — GSR's "every finding cites sources" rule applies.
- Schema is 6 fields. Do not add `schema_version`, `source`, `idea_type`, `type bucketing`, or a 20-entry cap — all explicitly rejected in the Deepening Review.
- Git never sees `~/.gsr/outcomes.md` — no `.gitignore` entry, no `.gitkeep`.

## Single open judgment call deferred to implementation

The "calibrator independence" question (should calibrator run when gsr-judge is bypassed, e.g., direct `/gsr:decide`?) is explicitly deferred. Default assumption: **no** — calibrator only fires inside the score workflow. Revisit only if a user reports the gap.

## Critical gotchas the reviewers surfaced

1. **Shadow workflow drift is a known failure mode.** `skills/quick/`, `skills/decide/`, and `skills/score/` all carry byte-identical copies of `score-workflow.md`. Every edit to one must hit the other two. Add a `diff -q` parity check to the test suite or this will regress silently.
2. **The 60-day nudge was the one reviewer conflict.** Code-simplicity wanted to drop it. I (senior-engineer pass) kept it because without the nudge the ledger fills with `pending` entries that never resolve → compound loop dies. Resolution: keep nudge + harden it + suppress in headless. Do not drop it.
3. **Prompt injection via `Lesson:` field is HIGH severity.** Users type free-form lessons; those strings get fed back into the judge's context. Wrap in `<untrusted_user_notes>` with distrust preamble — this is non-negotiable.

## Env vars introduced (document these in the /gsr:outcome SKILL.md)

- `GSR_NO_LEDGER=1` — disables ledger entirely (writes, reads, nudge)
- `GSR_NONINTERACTIVE=1` — suppresses nudge prompts (for headless / CI)
- `GSR_LEDGER_PATH=<path>` — overrides `~/.gsr/outcomes.md` (for testing)

## Acceptance criteria summary

See the Deepening Review for the full revised list. Headline items:
- [ ] `/gsr:outcome` works interactively and headlessly
- [ ] Running `/gsr:score` on verdict #3+ produces priors with citations in the scorecard reasoning
- [ ] Shadow score-workflow parity check passes
- [ ] `GSR_NO_LEDGER=1` produces zero file I/O in `~/.gsr/`
- [ ] Prompt injection test: a `Lesson:` containing `ignore previous instructions` does not affect judge output
- [ ] Nudge fires only when unresolved entries > 60 days old AND `GSR_NONINTERACTIVE` unset

## Resume command

```
/ce:work docs/plans/2026-04-11-001-feat-outcome-ledger-personal-calibration-plan.md
```

Start with Phase 1. Commit atomically per phase. Run the test suite at the end of each phase before moving to the next.
