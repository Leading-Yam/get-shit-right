# Changelog

All notable changes to GetShitRight will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- npm distribution as `get-shit-right-cc` — install via `npx get-shit-right-cc`
- SessionStart hook for background update checking (24-hour cooldown)
- Statusline hook showing yellow `⬆ /val:update` when update available
- File manifest with SHA256 hashes for detecting user modifications during updates
- Local patch backup system (`gsr-local-patches/`) with `/val:reapply-patches` recovery command
- Uninstall instructions in README
- WebSearch/WebFetch fallback for all research agents when Firecrawl is unavailable

### Changed
- `/val:update` now uses `npx get-shit-right-cc@latest` instead of `claude plugin update`
- Firecrawl reverted from hard requirement to optional enhancement — all workflows work without it
- Research agents try Firecrawl first, fall back to WebSearch/WebFetch if unavailable
- Install instructions updated from marketplace to npm
- `/val:help` version check removed (replaced by statusline hook)

### Removed
- Firecrawl probe gates from research, reverse, and skew workflows
- `curl` version check from `/val:help` Step 3
- SSH-based marketplace installation requirement
- "Update Check (Session Start)" section from CLAUDE.md

## [0.3.0] — 2026-03-18

### Added
- `/val:skew` command — Value Array analysis (Scale, Magnitude, Time, Ease, Place) to find 10x skew opportunities
- `gsr-value-skewer` agent — analyzes value delivery using DeMarco's framework
- VALUE-SKEW.md output template
- Required vs optional step definitions in state workflow (`reverse` and `skew` are optional, don't block COMPLETE)
- `skew` step added to STATE.md template between `reverse` and `research`

## [0.2.3] - 2026-03-17

### Added
- `/val:update` command — update GetShitRight from the marketplace with one command
- Version check in `/val:help` — silently checks GitHub for newer versions and prompts to update

## [0.2.2] - 2026-03-17

### Added
- Firecrawl probe gate for reverse workflow
- Progress status messages during research workflow
- Structured scraping targets for deep competitor analysis (7 mandatory sources)
- Evidence-backed spin-off angles with source URLs and engagement counts
- Moat check per angle — assesses how hard competitor can replicate
- Angle confidence scoring (1-5 composite: evidence + segment + moat)

### Changed
- REVERSE-ANALYSIS.md template includes evidence, moat, and confidence fields
- "Surprise me" in reverse workflow now picks highest confidence score (replaces heuristic)
- Angles ranked by confidence in presentation

## [0.2.1] - 2026-03-17

### Added
- Structured evidence format — every claim requires source URL, platform, engagement, and confidence
- Agent self-review step — flags unverified claims before writing output
- Search budget constraints — minimum platform coverage, maximum search limits per agent
- Scoring input sections — research output aligned to 7 scoring dimensions
- Smart merge — deduplication, cross-referencing, contradiction detection, signal reinforcement
- Actionable research gaps — each gap linked to scoring dimension with suggested founder action
- Estimated maintenance cost — tech stack cost range + budget check from founder interview
- Monthly Runway Budget question in idea interview

### Changed
- RESEARCH.md template restructured with new sections: Scoring Inputs, Converging Signals, Contradictions, Research Coverage, Research Gaps
- IDEA.md template includes Monthly Runway Budget field

## [0.2.0] - 2026-03-17

### Added
- Firecrawl probe gate — research and reverse workflows verify Firecrawl is installed before running
- CHANGELOG.md for tracking releases

### Changed
- Research agents now use Firecrawl exclusively (removed WebSearch/WebFetch fallback)
- Agent search instructions rewritten for `mcp__firecrawl__search` (discovery) and `mcp__firecrawl__scrape` (content extraction)

### Removed
- Firecrawl "nudge" tip — replaced by hard gate
- `firecrawl_nudge_shown` config field from STATE.md

## [0.1.0] - 2026-03-15

### Added
- Initial release: idea interview, parallel research, scoring, decision pipeline
- 7 slash commands: `/val:idea`, `/val:research`, `/val:score`, `/val:decide`, `/val:quick`, `/val:reverse`, `/val:help`
- 5 specialized agents: interviewer, researcher, competitor analyst, market sizer, judge
- Default-kill philosophy: BUILD requires 25+/35
