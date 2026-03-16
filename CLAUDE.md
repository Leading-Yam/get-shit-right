# GetShitRight — Project Rules

## What This Is
GetShitRight (GSR) is a Claude Code plugin that validates SaaS ideas before code is written.
It produces evidence-backed BUILD/PIVOT/KILL decisions with a default-kill philosophy.

## Architecture
- `commands/val/` — Slash command definitions (`/val:*`)
- `agents/` — Specialized agent definitions (`gsr-*`)
- `workflows/` — Implementation logic delegated from commands
- `templates/` — Canonical output format references for contributors

## Conventions
- Commands use YAML frontmatter with `name`, `description`, `allowed-tools`
- Commands delegate to workflow files via `<execution_context>` references
- Agents use XML-like sections: `<role>`, `<behavior>`, `<output_format>`
- All agent output must cite sources or explicitly mark assumptions
- Confidence levels: High / Medium / Low on every finding
- No enterprise language — direct, concise, founder-friendly tone

## State
- User state lives in `.validation/` in the user's project root
- `STATE.md` tracks workflow progress
- One idea per `.validation/` directory

## Scoring
- Default-kill: BUILD requires 25+/35
- 1/5 on Pain Intensity or Willingness to Pay = automatic KILL
- Every score must cite specific evidence
