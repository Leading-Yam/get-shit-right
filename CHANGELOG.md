# Changelog

All notable changes to GetShitRight will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
