# GSR Memory Schema

Defines the entity structure and relations for the GSR learning memory system,
stored in MCP Memory Server (`mcp__memory__*` tools).

## Entity Structure

### Entity Naming

Name: "learning:{agent}:{topic}:{short-hash}"
Type: "gsr-learning"

Examples:
- `learning:researcher:ih-search-unreliable:a3f`
- `learning:judge:founder-market-fit-override:b7c`
- `learning:market-sizer:webfetch-incomplete-extraction:d1e`

### Observations

Each entity stores these observations (one observation string per field):

| Field | Values | Description |
|-------|--------|-------------|
| layer | `global`, `project` | Which memory layer this belongs to |
| agent | `researcher`, `competitor-analyst`, `market-sizer`, `judge`, `value-skewer` | Which agent produced this learning |
| category | `platform-insight`, `tool-reliability`, `research-tactic`, `failure-mode`, `success-pattern` | Classification of the learning |
| signal | One sentence | The actual learning |
| evidence | One sentence | What triggered this learning |
| strength | `strong`, `moderate`, `weak` | How well-confirmed this learning is |
| project | Project identifier or `null` | Which project this relates to (null for global) |
| created | ISO date (YYYY-MM-DD) | When first observed |
| last_confirmed | ISO date (YYYY-MM-DD) | When last confirmed by new evidence |
| run_count | Integer as string | Times this learning was retrieved and relevant |

### Relations

| Relation | Meaning | When Created |
|----------|---------|-------------|
| `derived_from` | A global learning was generalized from this project learning | During cross-project promotion |
| `contradicts` | New evidence conflicts with this learning | During memory write when signals conflict |
| `supersedes` | This learning replaces an older version | When a learning is refined/updated |

## Memory Layers

### Layer 1: Working Memory (Session)

Not stored in MCP Memory. This is the natural conversation context:
- IDEA.md contents
- Agent outputs produced this session
- Validator feedback from this session

Dies when the session ends. Zero persistence overhead.

### Layer 2: Project Memory

- `layer: "project"`
- `project: "{idea-name}"` (derived from IDEA.md one-liner or REVERSE-ANALYSIS target)
- Written after each validation step completes
- Read at the start of any re-run for the same project
- Lifecycle: lives as long as the `.validation/` directory

### Layer 3: Global Memory

- `layer: "global"`
- `project: null`
- Written when a pattern is confirmed across 2+ different projects
- Read before every agent execution, regardless of project
- Lifecycle: persistent, pruned when stale

## Strength Rules

| Strength | Meaning | Transitions |
|----------|---------|------------|
| `weak` | Single observation, or contradicted by newer evidence | Initial state for project learnings |
| `moderate` | Confirmed 2x, or promoted from project to global | Initial state for global learnings |
| `strong` | Confirmed 3+ times across different contexts | Earned through repeated confirmation |

## Promotion

A project learning is promoted to global when:
1. A new project learning is written with the same `agent` + `category`
2. AND a similar `signal` exists tagged to a *different* project
3. The workflow creates a global entity with `strength: "moderate"` and `derived_from` relations to both project learnings

Signal similarity is determined by keyword overlap — the workflow searches MCP Memory with the agent name and key terms from the signal.

## Pruning

The system maintains a global run counter entity (`gsr:meta:run-counter`) that increments
on every workflow execution. Each learning's `run_count` tracks the last global counter
value at which it was retrieved.

A global learning is pruned when:
1. `gsr:meta:run-counter` minus the learning's `run_count` exceeds 10
2. This means 10+ workflow runs have occurred without this learning being retrieved
3. Pruned via `mcp__memory__delete_entities`

Before pruning, check if the learning has `derived_from` relations — if so, weaken to `strength: "weak"` first. Only prune if already weak.
