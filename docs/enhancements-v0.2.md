# GSR v0.2 Enhancements — Reference

## Core: Firecrawl Mandate
| # | Enhancement | Scope |
|---|------------|-------|
| 1 | Hard gate — research/reverse refuse to run without Firecrawl | `workflows/research.md`, `workflows/reverse.md` |
| 2 | Remove WebSearch/WebFetch fallback from all agents | `agents/gsr-researcher.md`, `agents/gsr-competitor-analyst.md`, `agents/gsr-market-sizer.md` |
| 3 | Firecrawl search replaces WebSearch for discovery | All three research agents |
| 4 | Remove Firecrawl nudge, gate replaces it | `workflows/research.md`, `templates/STATE.md` |

## Research Quality
| # | Enhancement | Scope |
|---|------------|-------|
| 5 | Structured evidence format — every claim needs `source URL + confidence` | All research agents |
| 6 | Search budget per agent — min/max searches, minimum platform coverage | All research agents |
| 7 | Research-to-scoring alignment — structure output around 7 scoring dimensions | Research agents + templates |
| 8 | Agent self-review step — re-read output, flag claims without URLs | All research agents |
| 9 | Estimated maintenance cost — tech stack cost range + budget check | `agents/gsr-market-sizer.md`, `agents/gsr-interviewer.md`, `templates/IDEA.md` |

## Research UX
| # | Enhancement | Scope |
|---|------------|-------|
| 10 | Smart merge with dedup + cross-referencing | `workflows/research.md` |
| 11 | Actionable research gaps — "couldn't find X, try doing Y" | All research agents |
| 12 | Progress callbacks during research | `workflows/research.md` |

## Reverse Engineer
| # | Enhancement | Scope |
|---|------------|-------|
| 13 | Firecrawl gate for reverse workflow | `workflows/reverse.md` |
| 14 | Structured scraping targets — pricing page, G2, Capterra, Crunchbase, LinkedIn | `agents/gsr-competitor-analyst.md` |
| 15 | Evidence-backed angles — cite review themes with URLs + engagement counts | `agents/gsr-competitor-analyst.md` |
| 16 | Moat check per angle — "How hard is this for competitor to replicate?" | `agents/gsr-competitor-analyst.md`, `templates/REVERSE-ANALYSIS.md` |
| 17 | Angle confidence scoring — rate each angle on evidence strength | `agents/gsr-competitor-analyst.md`, `templates/REVERSE-ANALYSIS.md` |

> Note: 17 enhancements across 3 phases. Phase 1 (v0.2.0): items 1-4. Phase 2 (v0.2.1): items 5-12. Phase 3 (v0.2.2): items 13-17.
