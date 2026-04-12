# Changelog

All notable changes to GetShitRight will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] — 2026-04-12

GSR now learns from reality. This release adds the Outcome Ledger: a local, private history of what actually happened after past BUILD / PIVOT / KILL calls. Once you’ve logged a few outcomes, future `/gsr:score` runs use that history to calibrate the judge with evidence-cited personal priors.

In plain English: GSR no longer just gives verdicts. It starts learning whether those verdicts were right.

### Added
- **Outcome ledger** — new user-global `~/.gsr/outcomes.md` ledger tracks pending and resolved BUILD/PIVOT/KILL verdict outcomes with the locked 6-field schema.
- **`/gsr:outcome` skill** — resolves pending verdicts interactively or headlessly (`slug=... status=... lesson=...`) for agent-native workflows.
- **Personal calibration loop** — new `gsr-calibrator` agent turns deterministic ledger digests into cited priors (`Prior: ... Evidence: ... Confidence: H|M|L`) for `/gsr:score` once at least 3 outcomes are resolved.
- **Stable `idea_slug`** — IDEA and STATE templates now include a deterministic slug (`YYYY-MM-DD-<sanitized-kebab>-<sha256(one_liner+timestamp)[:6]>`) for verdict-to-outcome linkage.
- **Workflow parity check** — `scripts/check-workflow-parity.sh` prevents drift across the three byte-identical score workflow mirrors.

### Security and Privacy
- **Untrusted lesson handling** — ledger excerpts are wrapped in `<untrusted_user_notes>` with a distrust preamble before calibrator/judge injection; lessons are stripped of control characters and truncated to 200 characters.
- **Ledger opt-out** — any non-empty `GSR_NO_LEDGER` value disables ledger reads, writes, digest generation, nudge scans, and pending writes. `GSR_NO_LEDGER=0` and `GSR_NO_LEDGER=false` also disable; unset to re-enable.
- **Headless safety** — `GSR_NONINTERACTIVE=1` suppresses the 60-day nudge and requires argument-based `/gsr:outcome` resolution.
- **Ledger path override** — `GSR_LEDGER_PATH=<path>` overrides `~/.gsr/outcomes.md`, primarily for tests and locked-down home directories.
- **Filesystem hardening** — ledger helper scripts refuse symlinked ledger paths, refuse world-writable ledger files, create with `umask 077`, and enforce `chmod 600`.

### Notes
- Lessons are stored unencrypted in `~/.gsr/outcomes.md` and will be read by future GSR agents. Do not paste secrets, API keys, or NDA content.
- Retrospective Prior Loop invariant: outcomes are human-resolved; priors are advisory; the judging agent never writes to its own training signal.

## [0.5.1] — 2026-04-02

### Fixed
- **CLAUDE.md doc skew** — conventions section incorrectly stated skill names should omit the plugin prefix; corrected to require `name: gsr:<skillname>` for autocomplete discovery

### Added
- `docs/solutions/integration-issues/skill-metadata-prefix-plugin-discovery.md` — compound solution doc for the skill naming fix

## [0.5.0] — 2026-03-31

### Breaking
- Command prefix changed from `/val:*` to `/gsr:*`
- Installation changed from `npx get-shit-right-cc` to `claude plugin install gsr`
- Removed `/val:update` and `/val:reapply-patches` (plugin system handles updates natively)

### Added
- Native Claude Code plugin format (`.claude-plugin/`, `skills/`)
- Workflow files co-located inside each skill directory for reliable `@` resolution
- Legacy cleanup instructions for npx users

### Removed
- `bin/install.js` — npx installer
- `commands/` directory — replaced by `skills/`
- `workflows/` directory — content moved into skill directories
- `hooks/` directory — plugin system handles updates and statusline
- `validators/` directory — not part of plugin format
- `memory/` directory — project-internal, not shipped
- `docs/` directory — project-internal, not shipped in plugin

### Changed
- `CLAUDE.md` rewritten for plugin context
- `README.md` updated with plugin install instructions
- `package.json` stripped to metadata only (no bin/files)

## [0.4.4] — 2026-03-20

### Fixed

- **Command discovery** — commands now install to `~/.claude/commands/val/` (user commands) and agents to `~/.claude/agents/` where Claude Code discovers them natively, without marketplace registration
- **Marketplace clone error** — removed `extraKnownMarketplaces` and `enabledPlugins` entries that caused Claude Code to attempt SSH git clone on every load, failing with `Permission denied (publickey)`
- **Broken symlink** — installer removes stale `~/.claude/commands/val` symlink from pre-npm installs
- **Legacy cleanup** — removes old installs from both `~/.claude/get-shit-right/` and `~/.claude/plugins/marketplaces/get-shit-right/`
- **Legacy hook cleanup** — purges all malformed GSR entries from settings.json

### Changed

- **Install layout** — commands, agents, and support files now go to separate locations matching Claude Code's native discovery paths
- **README** — added Upgrade section; pinned `@latest` tag; updated uninstall instructions

## [0.4.1] — 2026-03-20

### Fixed

- **Install hook registration** — `registerHooks()` now writes the correct `{ matcher, hooks: [{ type, command }] }` structure instead of bare `{ command }` objects, which caused `Expected array, but received undefined` on SessionStart
- **Invalid Statusline hook key** — Statusline is now registered as top-level `statusLine` config instead of inside `hooks` (which is not a valid hook event)
- **Hook deduplication** — dedup logic now checks inside nested `entry.hooks[].command` instead of `entry.command`
- **Cleanup of prior bad installs** — installer now removes stale `Statusline` key from `hooks` if left by previous versions

## [0.4.0] — 2026-03-19

### Architecture: Thin Agent, Heavy Tools

Major internal redesign separating agents, validators, and memory into three distinct layers.

**Agent layer** — All 6 agents rewritten as pure reasoning briefs. Agents focus on thinking, not following rigid templates. The judge now reasons through the scoring framework as advisory guidance, not mechanical rules.

**Validator layer** — New `validators/` directory with 5 validators:
- `evidence-integrity` (hard) — checks source URLs on factual claims
- `output-structure` (hard) — checks required sections against templates
- `research-coverage` (soft) — flags platform breadth gaps
- `scoring-integrity` (soft) — surfaces auto-KILL signals and unsupported scores
- `confidence-calibration` (soft) — flags confidence/evidence mismatches

Hard validators retry (max 2). Soft validators annotate output with flags.

**Memory layer** — New `memory/` module using MCP Memory Server:
- 3-layer memory: working (session), project (per-idea), global (cross-project)
- Agents receive relevant past learnings before execution
- Learnings compound over time — project insights promote to global after cross-project confirmation
- Token-efficient: max 5 learnings per agent, terse format, targeted retrieval

**Workflow changes** — All workflows updated to orchestrate the three layers:
- Tool routing centralized (Firecrawl detection done once, injected into agents)
- Memory read before agent execution, memory write after validation
- Validator dispatch with hard/soft classification per workflow

No changes to commands, templates, state management, or `.validation/` structure.
External behavior is identical — internal reasoning is dramatically improved.

## [0.3.0] — 2026-03-19

### Added
- npm distribution as `get-shit-right-cc` — install via `npx get-shit-right-cc`
- SessionStart hook for background update checking (24-hour cooldown)
- Statusline hook showing yellow `⬆ /val:update` when update available
- File manifest with SHA256 hashes for detecting user modifications during updates
- Local patch backup system (`gsr-local-patches/`) with `/val:reapply-patches` recovery command
- `/val:skew` command — Value Array analysis (Scale, Magnitude, Time, Ease, Place) to find 10x skew opportunities
- `gsr-value-skewer` agent — analyzes value delivery using DeMarco's framework
- VALUE-SKEW.md output template
- Required vs optional step definitions in state workflow (`reverse` and `skew` are optional, don't block COMPLETE)
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
