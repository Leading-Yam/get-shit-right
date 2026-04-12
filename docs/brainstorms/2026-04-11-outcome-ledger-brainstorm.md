---
date: 2026-04-11
topic: outcome-ledger
source_inspiration: https://github.com/HKUDS/OpenSpace
---

# Outcome Ledger + Personal Calibration

## What We're Building

A local-first feedback loop that closes GSR's biggest open weakness: we produce BUILD/PIVOT/KILL verdicts but never check if they were right. Users will be able to log what actually happened to past verdicts (shipped/killed/pivoted, revenue, time spent, lessons). On the next run of `/gsr:score`, the judge agent reads that ledger and applies personal calibration priors — e.g., "you've historically overrated market size by 2 points on 3 past ideas; adjusting." No cloud, no registry, no marketplace chicken-and-egg. Just a local ledger that compounds in value as the user accumulates decisions.

This is the essential from OpenSpace worth stealing: **judgments should be evaluated against reality, and that evaluation should feed back into the system.** Translated from OpenSpace's execution-skill context into GSR's verdict-framework context.

## Why This Approach

Three alternatives were considered and rejected:

- **Full cloud registry / MCP sync (vanilla OpenSpace port):** wrong shape. OpenSpace skills are execution tasks that break on API drift; GSR skills are research workflows that produce judgments. Copying the cloud infra wholesale is cargo-culting for a free plugin with unknown user density.
- **Structural verification gates only:** immediate quality lift but bounded ceiling. Additive, not compounding. A good consolation prize if the ledger proves too ambitious, not the headline bet.
- **Hybrid (gates + ledger staged):** splits focus across two features. Engineering instinct to de-risk, but violates "pick one clear bet."

Approach A is the only option that produces true compounding: each logged outcome multiplies the accuracy of every future verdict for that user. It ships lean because storage is a markdown file, not a database. And it creates an upgrade path to optional community aggregation in a future version — without blocking on it.

## Key Decisions

- **Local-first storage:** ledger lives on the user's machine. No server, no auth, no sync. v1 is a text file the user owns.
- **New skill `/gsr:outcome`:** the user-facing command to log a verdict's real-world outcome. Mirrors the existing `/gsr:idea`, `/gsr:score` shape.
- **Ledger is cross-idea, not per-idea:** unlike `.validation/` (which is one-idea-scoped), the ledger must span every verdict the user has ever made to enable calibration. Needs a home outside `.validation/`.
- **Calibration is applied by the judge agent, not hard-coded:** the ledger is injected into `gsr-judge`'s context window as historical priors; the judge interprets and adjusts rather than us writing a statistical engine. Keeps v1 scope tight.
- **Calibration threshold:** no calibration applied below N=3 logged outcomes (too sparse to mean anything). Below the threshold the ledger is collected silently — compounding begins at verdict #3, not day 1.
- **Compound upgrade path:** v2 could add optional anonymized export to a shared corpus. v1 must stand alone without it.
- **Verdict-to-outcome linkage:** each logged outcome must be joinable back to a prior verdict. Depends on `/gsr:idea` (or `/gsr:score`) emitting a stable `idea_slug` at creation time. If that field doesn't exist today, adding it is part of this work — surface it in the plan phase.

## Resolved Questions

1. **Ledger location → `~/.gsr/outcomes.md` (user-global).** Calibration coverage matters more than convention. A per-project ledger fragments the signal and starves the compound loop. Introduces one new home-directory path, justified by the payoff.
2. **Trigger → pull + soft nudge, bounded by 60-day rule.** Primary entry point is manual `/gsr:outcome`. The nudge fires *inside `/gsr:quick` and `/gsr:score` invocations* (not a Claude session-start hook — GSR doesn't own one), and *only if* the ledger contains unresolved verdicts older than 60 days. Fresh users see nothing; experienced users get one-line reminders when there's actual data to capture. The 60-day threshold is a heuristic: shorter than that and most ideas haven't played out yet; longer and users forget. Avoids both the "empty ledger" trap of pull-only and the "friction tax" of push-on-every-session.
3. **Schema → minimal binary.** v1 captures `{idea_slug, original_verdict, actual_outcome (shipped|killed|pivoted), lesson_learned}`. Revenue buckets deferred to v2. Priority is adoption, not richness.
4. **Judge wiring → new `gsr-calibrator` agent.** Dedicated agent runs before `gsr-judge` and injects calibration commentary. Cleaner separation of concerns even at the cost of one more agent file. Matches existing multi-agent pattern (interviewer / researcher / judge).
5. **Git behavior → non-issue.** `~/.gsr/outcomes.md` lives outside any repo. Git never sees it. No `.gitignore` entry, no `.gitkeep`, no concern.
6. **Relationship to `/gsr:reverse` → they stack.** `/gsr:reverse` analyzes *other people's* products for pattern extraction. The ledger analyzes *your own* past verdicts for calibration. Orthogonal use cases. No change to the existing skill.

## Open Questions

*(None remaining for brainstorm scope. Implementation details — file format, calibrator prompt structure, install script updates — belong in the plan phase.)*

## Next Steps

→ Run `/ce:plan docs/brainstorms/2026-04-11-outcome-ledger-brainstorm.md` to turn this into implementation steps
