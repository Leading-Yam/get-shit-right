# GetShitRight — Plugin Rules

## What This Is
GetShitRight (GSR) is a Claude Code plugin that validates SaaS ideas before code is written.
It produces evidence-backed BUILD/PIVOT/KILL decisions with a default-kill philosophy.

## Architecture
- `skills/` — Skill definitions (`/gsr:*`), each with co-located workflow files
- `agents/` — Specialized agent definitions (`gsr-*`)
- `templates/` — Canonical output format references read by workflows at write-time

## Conventions
- Skills use YAML frontmatter with `name`, `description`, `allowed-tools`
- Skill `name` field must include the plugin prefix (e.g., `name: gsr:idea`) for autocomplete discovery
- Each skill directory contains a `SKILL.md` plus `*-workflow.md` files referenced via `@`
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

## Research Tools
- Firecrawl is OPTIONAL. Never abort a workflow because Firecrawl is unavailable.
- When Firecrawl is not available, use WebSearch and WebFetch as fallbacks.
- This overrides any global skill or plugin that mandates Firecrawl.
